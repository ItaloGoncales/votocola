import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Candidate, CandidateHistory } from '../../database/entities/index.js';
import { ballotFor, type BallotSlot } from '../../domain/ballot.js';
import { isState, NATIONAL } from '../../domain/offices.js';
import { searchTerms } from '../../domain/text.js';
import { CandidateSort } from '../../graphql/enums.js';
import type { PageArgs } from '../../common/dtos/page.args.js';
import { PublicUrlService } from '../../common/public-url/public-url.service.js';
import { toCandidateDto, toHistoryDto, type MapperOptions } from './candidates.mapper.js';
import type { CandidateFilterInput } from './dtos/candidate-filter.js';
import type { CandidateDto, CandidatePageDto } from './dtos/candidate.dto.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate) private readonly candidates: Repository<Candidate>,
    @InjectRepository(CandidateHistory) private readonly history: Repository<CandidateHistory>,
    private readonly publicUrl: PublicUrlService,
    private readonly config: ConfigService,
  ) {}

  private mapperOptions(): MapperOptions {
    return {
      publicUrl: this.publicUrl.get(),
      showViews: this.config.get<boolean>('VIEW_COUNT_VISIBLE') !== false,
    };
  }

  ballot(state: string): BallotSlot[] {
    const uf = state.trim().toUpperCase();
    if (!isState(uf)) throw new BadRequestException('Invalid state');
    return ballotFor(uf);
  }

  async search(
    filter: CandidateFilterInput = {},
    page: Pick<PageArgs, 'limit' | 'offset'>,
    sort: CandidateSort = CandidateSort.POPULAR,
  ): Promise<CandidatePageDto> {
    const qb = this.candidates
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.party', 'p')
      .leftJoinAndSelect('c.attributes', 'a');

    if (!filter.includeInactive) qb.andWhere('c.active = true');
    if (filter.state) {
      // Quem vota numa UF vota nos candidatos dela e nos de presidente.
      qb.andWhere('c.state IN (:...states)', { states: [...new Set([filter.state, NATIONAL])] });
    }
    if (filter.office) qb.andWhere('c.office = :office', { office: filter.office });
    if (filter.partyNumber !== undefined) {
      qb.andWhere('c.partyNumber = :partyNumber', { partyNumber: filter.partyNumber });
    }
    if (filter.positions?.length) {
      qb.andWhere('COALESCE(c.position, p.position) IN (:...positions)', {
        positions: filter.positions,
      });
    }
    searchTerms(filter.query).forEach((term, i) => {
      qb.andWhere(`c.searchText LIKE :term${i}`, { [`term${i}`]: `%${term}%` });
    });
    (filter.attributes ?? []).forEach((slug, i) => {
      qb.andWhere(
        new Brackets((w) =>
          w.where(
            `EXISTS (SELECT 1 FROM candidate_attributes ca JOIN attributes at ON at.id = ca.attribute_id
              WHERE ca.candidate_id = c.id AND at.slug = :slug${i})`,
            { [`slug${i}`]: slug },
          ),
        ),
      );
    });

    // Mais vistos/escolhidos primeiro; empate pelo peso de partida (mandato + redes), depois nome.
    const popular =
      sort === CandidateSort.POPULAR && this.config.get<boolean>('POPULARITY_SORT') !== false;
    const [rows, total] = await qb
      .orderBy(popular ? 'c.popularity' : 'c.ballotName', popular ? 'DESC' : 'ASC')
      .addOrderBy(popular ? 'c.priorScore' : 'c.ballotName', popular ? 'DESC' : 'ASC')
      .addOrderBy('c.ballotName', 'ASC')
      .addOrderBy('c.id', 'ASC')
      .skip(page.offset)
      .take(page.limit)
      .getManyAndCount();

    const nextOffset = page.offset + rows.length;
    const hasMore = rows.length > 0 && nextOffset < total;
    return {
      items: rows.map((c) => toCandidateDto(c, this.mapperOptions())),
      total,
      hasMore,
      nextOffset: hasMore ? nextOffset : null,
    };
  }

  async findById(id: string): Promise<CandidateDto> {
    const candidate = UUID.test(id)
      ? await this.candidates.findOne({
          where: { id },
          relations: { party: true, attributes: true },
        })
      : null;
    if (!candidate) throw new NotFoundException('Candidate not found');
    const history = await this.history.find({
      where: { candidateId: candidate.id },
      order: { electionYear: 'DESC', id: 'ASC' },
    });
    const dto = toCandidateDto(candidate, this.mapperOptions());
    dto.history = history.map(toHistoryDto);
    return dto;
  }
}

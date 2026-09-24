export type Office =
  'PRESIDENT' | 'GOVERNOR' | 'SENATOR' | 'FEDERAL_DEPUTY' | 'STATE_DEPUTY' | 'DISTRICT_DEPUTY';

export type PoliticalPosition = 'LEFT' | 'CENTER_LEFT' | 'CENTER' | 'CENTER_RIGHT' | 'RIGHT';

export interface BallotSlot {
  key: string;
  office: Office;
  label: string;
  digits: number;
}

export interface Attribute {
  slug: string;
  name: string;
  group: string;
}

export interface SocialLink {
  /** instagram, facebook, tiktok, youtube, x, threads, kwai, linkedin, whatsapp, telegram ou site. */
  network: string;
  url: string;
}

/** Candidatura anterior (turno final), da mais recente para a mais antiga. */
export interface ElectionHistory {
  year: number;
  office: string;
  place: string | null;
  party: string | null;
  result: string | null;
  elected: boolean;
}

export interface Party {
  number: number;
  acronym: string;
  name: string;
  federationName: string | null;
}

export interface CandidateSummary {
  id: string;
  state: string;
  office: Office;
  officeLabel: string;
  number: string;
  ballotName: string;
  party: Pick<Party, 'acronym'>;
  position: PoliticalPosition | null;
  positionLabel: string | null;
  photoUrl: string | null;
  reelection: boolean;
  /** Visualizações do perfil; null quando a API desliga a exibição. */
  viewCount: number | null;
  viewCountLabel: string | null;
}

export interface Candidate extends CandidateSummary {
  fullName: string;
  party: Party;
  coalitionName: string | null;
  coalitionParties: string | null;
  age: number | null;
  gender: string | null;
  raceColor: string | null;
  education: string | null;
  occupation: string | null;
  status: string | null;
  statusDetail: string | null;
  active: boolean;
  planUrl: string | null;
  planSummary: string | null;
  attributes: Attribute[];
  socialLinks: SocialLink[];
  history: ElectionHistory[];
}

export interface CandidateFilter {
  state?: string;
  office?: Office;
  query?: string;
  positions?: PoliticalPosition[];
  attributes?: string[];
}

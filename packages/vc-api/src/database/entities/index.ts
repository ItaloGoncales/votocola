export * from './attribute.entity.js';
export * from './candidate-history.entity.js';
export * from './candidate.entity.js';
export * from './party.entity.js';

import { Attribute } from './attribute.entity.js';
import { CandidateHistory } from './candidate-history.entity.js';
import { Candidate } from './candidate.entity.js';
import { Party } from './party.entity.js';

/**
 * Lista explícita (sem glob): funciona em qualquer loader/bundler e evita instâncias duplicadas
 * das classes. Toda nova entity precisa ser adicionada aqui.
 */
export const entities = [Party, Attribute, Candidate, CandidateHistory];

import { API_URL } from '@/config';

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    /** `extensions.code` do primeiro erro (ex.: NOT_FOUND, BAD_REQUEST). */
    readonly code?: string,
  ) {
    super(message);
    this.name = 'GraphQLRequestError';
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
}

export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await res.json()) as GraphQLResponse<T>;
  const first = body.errors?.[0];
  if (first) throw new GraphQLRequestError(first.message, first.extensions?.code);
  return body.data as T;
}

export type PaginateResultMoreAvailable<T> = {
    values: T[];
    continuationToken: string;
    hasMore: true;
}

export type PaginateResultNoMoreAvailable<T> = {
    values: T[];
    hasMore: false;
}

export type PaginateResult<T> = PaginateResultNoMoreAvailable<T> | PaginateResultMoreAvailable<T>;

/**
 * Sample pagination of a given resource collection.
 * Use of continuation mandates values be stable across calls
 * @param values Values to paginate
 * @param pageSize Page size requested for next request
 * @param continuationToken Continuation token returned from a previous paginate request
 */
export function paginate<T>(values: T[], pageSize: number, continuationToken?: string): PaginateResult<T> {
    const start = continuationToken ? Number(continuationToken) : 0;
    const end = Math.min(start + pageSize, values.length);
    const pageValues = values.slice(start, end);

    if (end === values.length) {
        return {
            values: pageValues,
            hasMore: false
        };
    } else {
        return {
            values: pageValues,
            hasMore: true,
            continuationToken: `${end}`
        };
    }
}

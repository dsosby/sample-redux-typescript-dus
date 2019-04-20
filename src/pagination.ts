export type PaginateResultMoreAvailable = {
    continuationToken: string;
    hasMore: true;
}

export type PaginateResultNoMoreAvailable = {
    hasMore: false;
}

export type PaginateResult<T> = { values: T[] } & (PaginateResultNoMoreAvailable | PaginateResultMoreAvailable);

export function mergePaginateResults<T>(existingPage: PaginateResult<T>, newPage: PaginateResult<T>): PaginateResult<T> {
    const values = existingPage.values.concat(...newPage.values);
    return { ...newPage, values };
}

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

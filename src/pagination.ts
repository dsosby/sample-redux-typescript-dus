export type PaginatedHasMore = {
    continuationToken: string;
    hasMore: true;
}

export type PaginatedHasNoMore = {
    hasMore: false;
}

export type Paginated<T> = { loaded: T[] } & (PaginatedHasMore | PaginatedHasNoMore);

export function mergePages<T>(existingPage: Paginated<T>, newPage: Paginated<T>): Paginated<T> {
    const loaded = existingPage.loaded.concat(...newPage.loaded);
    return { ...newPage, loaded };
}

/**
 * Sample pagination of a given resource collection.
 * Use of continuation mandates values be stable across calls
 * @param values Values to paginate
 * @param pageSize Page size requested for next request
 * @param continuationToken Continuation token returned from a previous paginate request
 */
export function paginate<T>(values: T[], pageSize: number, continuationToken?: string): Paginated<T> {
    const start = continuationToken ? Number(continuationToken) : 0;
    const end = Math.min(start + pageSize, values.length);
    const pageValues = values.slice(start, end);

    if (end === values.length) {
        return {
            loaded: pageValues,
            hasMore: false
        };
    } else {
        return {
            loaded: pageValues,
            hasMore: true,
            continuationToken: `${end}`
        };
    }
}

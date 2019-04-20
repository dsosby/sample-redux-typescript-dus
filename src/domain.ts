// Domain models
export type UserId = number;
export type UserName = string;
export type Email = string;
export type Url = string;

export interface IUser {
    id: UserId;
    name: string;
    username: UserName;
    email: Email;
    website?: Url;
}

export type PageHasMore = {
    continuationToken: string;
    hasMore: true;
}

export type PageHasNoMore = {
    hasMore: false;
}

export type Page<T> = { values: T[] } & (PageHasNoMore | PageHasMore);

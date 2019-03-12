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

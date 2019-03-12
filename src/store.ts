import { createStore } from 'redux';

type UserId = number;
type UserName = string;
type Email = string;
type Url = string;
type ErrorMessage = string;

interface IUser {
    id: UserId;
    name: string;
    username: UserName;
    email: Email;
    website?: Url;
}

interface IDelayedNotStarted { status: 'NotStarted' }
interface IDelayedPending { status: 'Pending' }
interface IDelayedAvailable<T> { status: 'Available'; value: T }
interface IDelayedError { status: 'Error'; message: ErrorMessage }
const DelayedNotStarted = (): IDelayedNotStarted => ({ status: 'NotStarted' });
const DelayedPending = (): IDelayedPending => ({ status: 'Pending' });
const DelayedError = (message: ErrorMessage): IDelayedError => ({ status: 'Error', message });
function DelayedAvailable<T>(value: T): IDelayedAvailable<T> { return { status: 'Available', value }; };
type Delayed<T> = IDelayedNotStarted | IDelayedPending | IDelayedAvailable<T> | IDelayedError;

interface IAppState {
    users: Delayed<IUser[]>
}

const InitialAppState : IAppState = {
    users: DelayedNotStarted()
}

export type Action =
    { type: 'SET_USERS'; users: Delayed<IUser[]> }
|   { type: 'REMOVE_USER'; userId: UserId }

const AppReducer = (state: IAppState = InitialAppState, action: Action): IAppState => {
    switch (action.type) {
        case 'SET_USERS':
            return { ...state, ...{ users: action.users } };
        case 'REMOVE_USER':
            switch (state.users.status) {
                case 'Available':
                    const updatedUserList = state.users.value.filter(user => user.id === action.userId);
                    return { ...state, ...{ users: DelayedAvailable(updatedUserList) }};
                default:
                    // Can't remove users that aren't yet loaded
                    return state;
            }
    }

    return state;
}

let store = createStore<IAppState, Action, {}, {}>(AppReducer);

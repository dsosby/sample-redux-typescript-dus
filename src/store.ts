import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import axios, { AxiosPromise } from 'axios';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Delayed, NotStarted, Pending, Available, Error, Updatable } from './Delayed';
import { IUser } from './domain';
import { paginate, Paginated, mergePages } from './pagination';

// Fake a pagination over a URL providing full collection
const getPaginatedUsers = (url: string, continuationToken?: string): Promise<Paginated<IUser>> => {
    const pageSize = 3;
    return new Promise((resolve, reject) => {
        // Fake latency so we can see Pending state
        setTimeout(() => {
            axios.get<IUser[]>(url)
                .then(response => resolve(paginate(response.data, pageSize, continuationToken)))
                .catch(error => reject(`HTTP Error ${error.response.status}`));
        }, 1000);
    });
}

// App State
type Users = Paginated<IUser> & Updatable;
type UsersState = Delayed<Users>;

export interface IAppState {
    users: UsersState;
}

const InitialAppState : IAppState = {
    users: NotStarted()
}

// Selectors
export const hasMoreUsers = (state: IAppState): boolean => {
    return state.users.status === 'Available'
        && state.users.value.hasMore;
}
export const isLoadingMoreUsers = (state: IAppState): boolean => {
    return state.users.status === 'Available'
        && !!state.users.value.update
        && state.users.value.update.status === 'Pending';
}


// Action creators
type AppThunkAction<T> = ThunkAction<T, IAppState, undefined, Action>;
type Action =
    { type: 'SET_USERS'; users: UsersState } |
    { type: 'UPDATE_USERS'; update: Delayed<Paginated<IUser>> }

function setUsers(users: UsersState): Action {
    return {
        type: 'SET_USERS',
        users
    };
}

function updateUsers(update: Delayed<Paginated<IUser>>): Action {
    return {
        type: 'UPDATE_USERS',
        update
    };
}

export function clearUsers(): Action {
    return {
        type: 'SET_USERS',
        users: NotStarted()
    };
}

const UsersUrl = 'https://jsonplaceholder.typicode.com/users';
const BadUsersUrl = 'https://jsonplaceholder.typicode.com/nonexistent';

export function errorUsers(): AppThunkAction<any> {
    return loadUsers(BadUsersUrl);
}

export function loadUsers(url: string = UsersUrl): AppThunkAction<any> {
    return (dispatch, getState) => {
        switch (getState().users.status) {
            case 'NotStarted':
            case 'Error':
                dispatch(setUsers(Pending()));
                getPaginatedUsers(url)
                    .then(usersPage => dispatch(setUsers(Available(Updatable(usersPage)))))
                    .catch(error => dispatch(setUsers(Error(error))));
        }
    }
}

export function loadMoreUsers(): AppThunkAction<any> {
    return (dispatch, getState) => {
        const state = getState();
        const { users } = state;

        // Check if we can load more (has to be done to get continuation token)
        if (users.status === 'Available' && users.value.hasMore) {
            // Disallow duplicate requests
            if (users.value.update.status !== 'Pending') {
                const continuationToken = users.value.continuationToken;
                dispatch(updateUsers(Pending()));
                getPaginatedUsers(UsersUrl, continuationToken)
                    .then(nextPage => dispatch(updateUsers(Available(nextPage))))
                    .catch(error => dispatch(updateUsers(Error(error))));
            }
        }
    }
}

const AppReducer = (state: IAppState = InitialAppState, action: Action): IAppState => {
    switch (action.type) {
        case 'SET_USERS':
            return { ...state, ...{ users: action.users } };
        case 'UPDATE_USERS':
            // Updates have several choices for implementation:
            //  - block create on update by asserting state.users.status === 'Available'
            //  - decide to maintain existing value during the update by overwriting the updateable value
            if (state.users.status === 'Available') {
                const update = action.update;
                switch (update.status) {
                    case 'Available':
                        // New page of data available... merge it on
                        const updatedPage = mergePages(state.users.value, update.value);
                        return { ...state, ...{ users: Available(Updatable(updatedPage)) } };
                    default:
                        // Maintain existing value and only update the "update" status
                        const existingPage = state.users.value;
                        return { ...state, ...{ users: Available(Updatable(existingPage, update )) }};
                }
            }

    }

    return state;
}

const middleware = [thunk];
let store = createStore<IAppState, Action, {}, {}>(AppReducer, InitialAppState, composeWithDevTools(applyMiddleware(...middleware)));
export default store;

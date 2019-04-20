import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import axios, { AxiosPromise } from 'axios';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Delayed, NotStarted, Pending, Available, Error, ErrorMessage, Updateable } from './Delayed';
import { IUser } from './domain';
import { mergePaginateResults, paginate, PaginateResult } from './pagination';

// Fake a pagination over a URL providing full collection
const getPaginatedUsers = (url: string, continuationToken?: string): Promise<PaginateResult<IUser>> => {
    const pageSize = 3;
    return new Promise((resolve, reject) => {
        // Fake latency so we can see Pending state
        setTimeout(() => {
            axios.get<IUser[]>(url)
                .then(response => resolve(paginate(response.data, pageSize, continuationToken)))
                .catch(error => reject(Error(`HTTP Error ${error.response.status}`)));
        }, 1000);
    });
}

// App State
type UsersPage = Updateable<PaginateResult<IUser>>;
type UsersState = Delayed<UsersPage>;

export interface IAppState {
    users: UsersState;
}

const InitialAppState : IAppState = {
    users: NotStarted()
}

// Selectors
const hasMoreUsers = (state: IAppState): boolean => {
    return state.users.status === 'Available'
        && state.users.value.value.hasMore;
}
const isLoadingMoreUsers = (state: IAppState): boolean => {
    return state.users.status === 'Available'
        && state.users.value.updateState.status === 'Pending';
}


// Action creators
type AppThunkAction<T> = ThunkAction<T, IAppState, undefined, Action>;
type Action =
    { type: 'SET_USERS'; users: UsersState } |
    { type: 'UPDATE_USERS'; update: Delayed<PaginateResult<IUser>> }

function setUsers(users: UsersState): Action {
    return {
        type: 'SET_USERS',
        users
    };
}

function updateUsers(update: Delayed<PaginateResult<IUser>>): Action {
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
                    .then(usersPage => dispatch(setUsers(Available(Updateable(usersPage)))))
                    .catch(error => dispatch(setUsers(Error(`HTTP Error ${error.response.status}`))));
        }
    }
}

export function loadMoreUsers(): AppThunkAction<any> {
    return (dispatch, getState) => {
        const state = getState();
        const { users } = state;

        if (users.status === 'Available') {
            // Can only do something if the first page is loaded
            if (hasMoreUsers(state) && !isLoadingMoreUsers(state)) {
                dispatch(updateUsers(Pending()));
                getPaginatedUsers(UsersUrl)
                    .then(nextPage => {
                        const updatedUsers = mergePaginateResults(users.value.value, nextPage);
                        dispatch(updateUsers(Available(updatedUsers)));
                    })
                    .catch(error => dispatch(updateUsers(Error(`HTTP Error ${error.response.status}`))));
            }
        }
    }
}

const AppReducer = (state: IAppState = InitialAppState, action: Action): IAppState => {
    switch (action.type) {
        case 'SET_USERS':
            return { ...state, ...{ users: action.users } };
        case 'UPDATE_USERS':
            // Could check for state.users.status === 'Available' if we want to avoid create on update
            // Let's just allow it in this example case
            return { ...state, ...{ users: Available(action.update) }};
    }

    return state;
}

const middleware = [thunk];
let store = createStore<IAppState, Action, {}, {}>(AppReducer, InitialAppState, composeWithDevTools(applyMiddleware(...middleware)));
export default store;

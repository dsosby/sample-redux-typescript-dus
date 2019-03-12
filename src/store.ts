import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import axios from 'axios';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Delayed, NotStarted, Pending, Available, Error, ErrorMessage } from './Delayed';
import { IUser, UserId } from './domain';

// Action creators
type AppThunkAction<T> = ThunkAction<T, IAppState, undefined, Action>;
type Action =
    { type: 'SET_USERS'; users: Delayed<IUser[]> }
|   { type: 'REMOVE_USER'; userId: UserId }

function setUsers(users: Delayed<IUser[]>): Action {
    return {
        type: 'SET_USERS',
        users
    };
}

export function removeUser(userId: UserId): Action {
    return {
        type: 'REMOVE_USER',
        userId
    };
}

export function clearUsers(): Action {
    return {
        type: 'SET_USERS',
        users: NotStarted()
    };
}

export function errorUsers(): AppThunkAction<any> {
    return loadUsers('https://jsonplaceholder.typicode.com/nonexistent');
}

export function loadUsers(url: string = 'https://jsonplaceholder.typicode.com/users'): AppThunkAction<any> {
    return (dispatch, getState) => {
        switch (getState().users.status) {
            case 'NotStarted':
            case 'Error':
                dispatch(setUsers(Pending()));
                setTimeout(() => {
                    axios.get<IUser[]>(url)
                        .then(response => dispatch(setUsers(Available(response.data))))
                        .catch(error => dispatch(setUsers(Error(`HTTP Error ${error.response.status}`))));
                }, 1000);
        }
    }
}

// App State
export interface IAppState {
    users: Delayed<IUser[]>
}

const InitialAppState : IAppState = {
    users: NotStarted()
}

const AppReducer = (state: IAppState = InitialAppState, action: Action): IAppState => {
    switch (action.type) {
        case 'SET_USERS':
            return { ...state, ...{ users: action.users } };
        case 'REMOVE_USER':
            // Note that developers can't access the current user list (state.users.value)
            // until its availability state is confirmed. This makes it apparent that
            // other cases should be handled as well (what if we remove users while the
            // network load is still pending?)
            // Also of note, the status strings are autocompleted/type-checked
            if (state.users.status === 'Available') {
                const updatedUserList = state.users.value.filter(user => user.id === action.userId);
                return { ...state, ...{ users: Available(updatedUserList) }};
            }
    }

    return state;
}

const middleware = [thunk];
let store = createStore<IAppState, Action, {}, {}>(AppReducer, InitialAppState, composeWithDevTools(applyMiddleware(...middleware)));
export default store;

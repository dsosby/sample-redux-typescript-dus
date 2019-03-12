import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import axios from 'axios';
import { Dispatch } from 'react';
import { composeWithDevTools } from 'redux-devtools-extension';

// Domain models
type UserId = number;
type UserName = string;
type Email = string;
type Url = string;
type ErrorMessage = string;

export interface IUser {
    id: UserId;
    name: string;
    username: UserName;
    email: Email;
    website?: Url;
}

// DU models
export interface IDelayedNotStarted { status: 'NotStarted' }
export interface IDelayedPending { status: 'Pending' }
export interface IDelayedAvailable<T> { status: 'Available'; value: T }
export interface IDelayedError { status: 'Error'; message: ErrorMessage }
// Constructors for DU types
export const DelayedNotStarted = (): IDelayedNotStarted => ({ status: 'NotStarted' });
export const DelayedPending = (): IDelayedPending => ({ status: 'Pending' });
export const DelayedError = (message: ErrorMessage): IDelayedError => ({ status: 'Error', message });
export function DelayedAvailable<T>(value: T): IDelayedAvailable<T> { return { status: 'Available', value }; };
// DU for a delayed-load data set, e.g. result of a network load
export type Delayed<T> = IDelayedNotStarted | IDelayedPending | IDelayedAvailable<T> | IDelayedError;

// Action creators

export type Action =
    { type: 'SET_USERS'; users: Delayed<IUser[]> }
|   { type: 'REMOVE_USER'; userId: UserId }

function setUsers(users: Delayed<IUser[]>): Action {
    return {
        type: 'SET_USERS',
        users
    };
}

function removeUser(userId: UserId): Action {
    return {
        type: 'REMOVE_USER',
        userId
    };
}

type AppThunkAction<T> = ThunkAction<T, IAppState, undefined, Action>;
type AppThunkDispatch = ThunkDispatch<IAppState, undefined, Action>;
export function loadUsers(): AppThunkAction<any> {
    return (dispatch, getState) => {
        switch (getState().users.status) {
            case 'NotStarted':
            case 'Error':
                dispatch(setUsers(DelayedPending()));
                axios.get<IUser[]>('https://jsonplaceholder.typicode.com/users')
                    .then(response => dispatch(setUsers(DelayedAvailable(response.data))))
                    .catch(error => DelayedError(JSON.stringify(error)));
        }
    }
}

// App State
export interface IAppState {
    users: Delayed<IUser[]>
}

const InitialAppState : IAppState = {
    users: DelayedNotStarted()
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
                return { ...state, ...{ users: DelayedAvailable(updatedUserList) }};
            }
    }

    return state;
}

const middleware = [thunk];
let store = createStore<IAppState, Action, {}, {}>(AppReducer, InitialAppState, composeWithDevTools(applyMiddleware(...middleware)));
export default store;

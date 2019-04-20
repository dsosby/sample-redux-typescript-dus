import { values } from "@uifabric/utilities";

export type ErrorMessage = string;
export type DelayedError = ErrorMessage;

interface IDelayedNotStarted { status: 'NotStarted' }
interface IDelayedPending { status: 'Pending' }
interface IDelayedAvailable<T> { status: 'Available'; value: T }
interface IDelayedError { status: 'Error'; error: ErrorMessage }

// Constructors for DU types
export const NotStarted = (): IDelayedNotStarted => ({ status: 'NotStarted' });
export const Pending = (): IDelayedPending => ({ status: 'Pending' });
export const Error = (error: DelayedError): IDelayedError => ({ status: 'Error', error});

// DU for a delayed-load data set, e.g. result of a network load
export type Update = IDelayedNotStarted | IDelayedPending | IDelayedError;
export type Delayed<T> = IDelayedNotStarted | IDelayedPending | IDelayedAvailable<T> | IDelayedError;
export type Updatable = {
    update: Update;
}

// Factories
export function Available<T>(value: T): IDelayedAvailable<T> { return { status: 'Available', value }; };
export function Updatable<T>(value: T, update: Update = NotStarted()): Updatable & T { return { ...value, update }};
export function Project<T,S>(delayed: Delayed<T>, projectFn: (value: T) => S ): Delayed<S> {
    return delayed.status === 'Available'
        ? Available(projectFn(delayed.value))
        : { ...delayed };
}

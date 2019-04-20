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
export type Delayed<T> = IDelayedNotStarted | IDelayedPending | IDelayedAvailable<T> | IDelayedError;
export type Updateable<T> = {
    value: T;
    updateState: Delayed<void>;
}

// Factories
export function Available<T>(value: T): IDelayedAvailable<T> { return { status: 'Available', value }; };
export function Updateable<T>(value: T, updateState: Delayed<void> = NotStarted()): Updateable<T> { return { value, updateState }};
export function OnlyStatus<T>(delayed: Delayed<T>): Delayed<void> {
    switch (delayed.status) {
        case 'Available':
            return Available(undefined);
        default:
            return delayed;
    }
}

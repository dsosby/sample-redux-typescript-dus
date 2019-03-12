type ErrorMessage = string;

interface IDelayedNotStarted { status: 'NotStarted' }
interface IDelayedPending { status: 'Pending' }
interface IDelayedAvailable<T> { status: 'Available'; value: T }
interface IDelayedError { status: 'Error'; message: ErrorMessage }

// Constructors for DU types
export const NotStarted = (): IDelayedNotStarted => ({ status: 'NotStarted' });
export const Pending = (): IDelayedPending => ({ status: 'Pending' });
export const Error = (message: ErrorMessage): IDelayedError => ({ status: 'Error', message });
export function Available<T>(value: T): IDelayedAvailable<T> { return { status: 'Available', value }; };

// DU for a delayed-load data set, e.g. result of a network load
export type Delayed<T> = IDelayedNotStarted | IDelayedPending | IDelayedAvailable<T> | IDelayedError;

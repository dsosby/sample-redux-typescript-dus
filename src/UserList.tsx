import React, { FunctionComponent } from 'react';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { Delayed, IUser } from './store';

type DelayedUserList = Delayed<IUser[]>;
interface IUserListProps {
    users: DelayedUserList;
}

const getStatusString = (users: DelayedUserList): string => {
    switch (users.status) {
        case 'Available': return `Fetched ${users.value.length} users`;
        case 'Error': return `Error: ${users.message}`;
        case 'NotStarted': return `Click load`;
        case 'Pending': return `Loading`;
    }
}

export const UserList: FunctionComponent<IUserListProps> = (props) => {
    const { users } = props;
    const statusString = getStatusString(users);
    return (
        <div>{statusString}</div>
    )
}

export default UserList;

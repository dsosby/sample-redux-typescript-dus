import React, { FunctionComponent } from 'react';
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { IUser } from './store';
import { Delayed } from './Delayed';

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

function makeColumn<T>(field: keyof T, prettyName?: string): IColumn {
    const fieldString = field.toString()
    return {
        key: fieldString,
        name: prettyName || fieldString,
        fieldName: fieldString,
        minWidth: 150 /*what units?*/
    };
}

const UserColumns = [makeColumn('name'), makeColumn('email'), makeColumn('website')];

export const UserList: FunctionComponent<IUserListProps> = (props) => {
    const { users } = props;

    switch (users.status) {
        case 'NotStarted': return <div>Click load</div>;
        case 'Error': return <div>An error occurred: {users.message}</div>
        case 'Pending':
        case 'Available':
            const enableShimmer = (users.status === 'Pending');
            const items = (users.status === 'Available') ? users.value : [];

            return <ShimmeredDetailsList enableShimmer={enableShimmer}
                                         items={items}
                                         columns={UserColumns}></ShimmeredDetailsList>
    }
}

export default UserList;

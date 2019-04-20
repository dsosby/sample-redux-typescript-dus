import React, { Component, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { IAppState, loadUsers, loadMoreUsers, clearUsers, errorUsers, hasMoreUsers, isLoadingMoreUsers } from './store';
import { Project } from './Delayed';
import { Button, DefaultButton } from 'office-ui-fabric-react';
import { UserList } from './UserList';

import './App.css';

const mapStateToProps = (state: IAppState) => {
  return {
    users: Project(state.users, paginatedUsers => paginatedUsers.loaded),
    hasMoreUsers: hasMoreUsers(state),
    isLoadingMoreUsers: isLoadingMoreUsers(state)
  };
};

const mapDispatchToProps = { loadUsers, loadMoreUsers, clearUsers, errorUsers };

type IAppProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageSplit: FunctionComponent<{}> = () => {
  return <div className="pagesplit"></div>
};

class App extends Component<IAppProps> {
  render() {
    const {
      users,
      clearUsers,
      loadUsers,
      errorUsers,
      hasMoreUsers,
      loadMoreUsers,
      isLoadingMoreUsers
    } = this.props;

    let actionButtons = users.status === 'Available'
      ? <Button onClick={() => clearUsers()}>Clear users</Button>
      : <div className="actions">
          <DefaultButton onClick={() => loadUsers()}>Load users</DefaultButton>
          <Button onClick={() => errorUsers()}>Fake loading error</Button>
        </div>;

    return (
      <div className="App">
        <header className="App-header">
          {actionButtons}
          <PageSplit></PageSplit>
          <UserList users={users} />
          { hasMoreUsers && <Button onClick={() => loadMoreUsers()} disabled={isLoadingMoreUsers}>Load More</Button> }
        </header>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

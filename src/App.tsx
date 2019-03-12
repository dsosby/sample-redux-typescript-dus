import React, { Component, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { IAppState, loadUsers, clearUsers, errorUsers } from './store';
import { Button, DefaultButton } from 'office-ui-fabric-react';
import { UserList } from './UserList';

import './App.css';

const mapStateToProps = (state: IAppState) => {
  return {
    users: state.users
  };
};

const mapDispatchToProps = { loadUsers, clearUsers, errorUsers };

type IAppProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageSplit: FunctionComponent<{}> = () => {
  return <div className="pagesplit"></div>
};

class App extends Component<IAppProps> {
  render() {
    const { users, clearUsers, loadUsers, errorUsers } = this.props;
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
        </header>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

import React, { Component, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Delayed } from './Delayed';
import { IAppState, loadUsers, clearUsers } from './store';
import { Button, DefaultButton } from 'office-ui-fabric-react';
import { UserList } from './UserList';

import './App.css';

const mapStateToProps = (state: IAppState) => {
  return {
    users: state.users
  };
};

const mapDispatchToProps = { loadUsers, clearUsers };

type IAppProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageSplit: FunctionComponent<{}> = () => {
  return <div className="pagesplit"></div>
};

class App extends Component<IAppProps> {
  render() {
    const { clearUsers, loadUsers, users } = this.props;

    let actionButton = users.status === 'Available'
      ? <Button onClick={() => clearUsers()}>Clear users</Button>
      : <DefaultButton onClick={() => loadUsers()}>Load users</DefaultButton>;

    return (
      <div className="App">
        <header className="App-header">
          {actionButton}
          <PageSplit></PageSplit>
          <UserList users={users} />
        </header>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

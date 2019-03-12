import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IAppState, loadUsers, Delayed } from './store';

import './App.css';

const mapStateToProps = (state: IAppState) => {
  return {
    users: state.users
  };
};

const mapDispatchToProps = { loadUsers };

type IAppProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

class App extends Component<IAppProps> {
  render() {
    const { loadUsers, users } = this.props;

    return (
      <div className="App">
        <header className="App-header">
          <button onClick={() => loadUsers()}>Load users</button>
        </header>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

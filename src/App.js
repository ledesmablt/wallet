import React, { useState, useEffect } from 'react';
import { StoreProvider, useStoreState, useStoreActions } from 'easy-peasy';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import store from './stores/store';
import logo from './logo.svg';
import './App.css';
import Scorecard from './components/Scorecard';
import { RecordTable } from './components/Record';
import { CreateRecordButton } from './components/Buttons';
import { CreateRecordPage, ModifyRecordPage } from './components/Record';

function InitialApiCalls() {
  // fill "items"
  const getCategories = useStoreActions(actions => actions.categories.get);
  const getRecords = useStoreActions(actions => actions.records.get);
  getCategories();
  getRecords();
  return null;
}

function Nav() {
  return (
    <header className="Nav">
      <img src={logo} className="Nav-logo" alt="logo" />
      <Link className="Nav-url" to="/">Home</Link>
      <Link className="Nav-url" to="/records">Records</Link>
      <Link className="Nav-url" to="/">Categories</Link>
      <Link className="Nav-url" to="/">Settings</Link>
    </header>
  );
}

function Greeting({ pageName }) {
  const todayString = (new Date()).toLocaleDateString();
  return (
    <div className="section-container">
      <h1 className="App-greeting section-header">{ pageName }</h1>
      <h2 className="App-greeting-sub">{ todayString }</h2>
    </div>
  )
}

function Overview() {
  const [overviewValues, setOverviewValues] = useState({});
  const records = useStoreState(state => state.records);
  useEffect(() => {
    setOverviewValues(records);
  }, [records]);
  return (
    <div className="Overview section-container">
      <Scorecard label="Balance" value={overviewValues.balance} />
      <Scorecard label="Income" value={overviewValues.income} />
      <Scorecard label="Expenses" value={overviewValues.expenses} />
    </div>
  );
}

function RecordsPreview() {
  return (
    <div className="section-container">
      <h2 className="section-header">Recent Entries</h2>
      <RecordTable show="5"/>
    </div>
  )
}

function CreateRecordsContainer() {
  const currentAppState = useStoreState(state => state.app.currentState);
  const updateAppState = useStoreActions(actions => actions.app.updateState);
  return (
    <div className="CreateRecordsContainer">
      <CreateRecordButton
          onClick={() => updateAppState('createRecord')}
      />
      <div className={
          (["createRecord", "modifyRecord"].includes(currentAppState) ? "fadeIn" : "fadeOut") + " BlurBackdrop"
        }>
        <CreateRecordPage
          subClassName={currentAppState === "createRecord" ? "slideIn" : "slideOut"}
          onCancel={() => updateAppState('normal')}
        />
        <ModifyRecordPage
          subClassName={currentAppState === "modifyRecord" ? "slideIn" : "slideOut"}
          onCancel={() => updateAppState('normal')}
        />
      </div>
    </div>
  )
}

function Home() {
  return (
    <main>
      <Greeting pageName="Home" />
      <Overview />
      <RecordsPreview />
      <CreateRecordsContainer />
    </main>
  )
}

function Records() {
  return (
    <main>
      <Greeting pageName="Records" />
        <RecordTable />
        <CreateRecordsContainer />
    </main>
  )
}

function Main() {
  return (
    <div className="App">
      <Router>
        <Nav />
        <Switch>
          <Route path="/records">
            <Records />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}


function App() {
  return (
  <StoreProvider store={store}>
    <InitialApiCalls />
    <Main />
  </StoreProvider>
  );
}

export default App;

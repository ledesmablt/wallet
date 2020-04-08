import React, { useState, useEffect } from 'react';
import { StoreProvider, useStoreState, useStoreActions } from 'easy-peasy';
import store from './stores/store';
import logo from './logo.svg';
import './App.css';
import Scorecard from './components/Scorecard';
import { RecordTable } from './components/Record';
import { CreateRecordButton } from './components/Buttons';
import { CreateRecordPage, ModifyRecordPage } from './components/Record';

function Nav() {
  return (
    <header className="Nav">
      <img src={logo} className="Nav-logo" alt="logo" />
      <a href="/" className="Nav-url">Home</a>
      <a href="/" className="Nav-url">Records</a>
      <a href="/" className="Nav-url">Categories</a>
      <a href="/" className="Nav-url">Settings</a>
    </header>
  );
}

function Overview() {
  const [overviewValues, setOverviewValues] = useState({});
  const records = useStoreState(state => state.records);
  useEffect(() => {
    setOverviewValues(records);
  }, [records]);
  
  return (
    <div className="Overview">
      <Scorecard label="Balance" value={overviewValues.balance} />
      <Scorecard label="Income" value={overviewValues.income} />
      <Scorecard label="Expenses" value={overviewValues.expenses} />
    </div>
  );
}

function RecordsPreview() {
  return (
    <div className="LastRecords">
      <h2 className="section-header">Last 10 Entries</h2>
      <RecordTable />
    </div>
  )
}

function InitialApiCalls() {
  // fill "items"
  const getCategories = useStoreActions(actions => actions.categories.get);
  const getRecords = useStoreActions(actions => actions.records.get);
  getCategories();
  getRecords();
  return null;
}

function Main() {
  const currentAppState = useStoreState(state => state.app.currentState);
  const updateAppState = useStoreActions(actions => actions.app.updateState);
  const todayString = (new Date()).toLocaleDateString();

  return (
    <div className="App">
      <Nav />
      <main>
        <h1 className="App-greeting section-header">Hello, Benj</h1>
        <h2 className="App-greeting-sub">{ todayString }</h2>
        <Overview />
        <RecordsPreview />
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
      </main>
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

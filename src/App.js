import React from 'react';
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
  // fill records and categories in store
  const getCategories = useStoreActions(actions => actions.categories.get);
  const getRecords = useStoreActions(actions => actions.records.get);
  getCategories();
  getRecords();
  return null;
}

function Nav() {
  // nav bar for react router
  return (
    <header className="Nav">
      <img src={logo} className="Nav-logo" alt="logo" />
      <Link className="Nav-url" to="/">Home</Link>
      <Link className="Nav-url" to="/records">Records</Link>
      <Link className="Nav-url" to="/categories">Categories</Link>
      <Link className="Nav-url" to="/settings">Settings</Link>
    </header>
  );
}

function SectionHeader({ pageName }) {
  // current page and date today
  const todayString = (new Date()).toLocaleDateString();
  return (
    <div className="section-container">
      <h1 className="section-header">{ pageName }</h1>
      <h2>{ todayString }</h2>
    </div>
  );
}

function Overview() {
  // container for the Scorecards
  const records = useStoreState(state => state.records);
  return (
    <div className="Overview section-container">
      <Scorecard label="Balance" value={records.balance} />
      <Scorecard label="Income" value={records.income} />
      <Scorecard label="Expenses" value={records.expenses} />
    </div>
  );
}

function RecordsPreview() {
  // last 5 records
  return (
    <div className="section-container">
      <h2 className="section-header">Recent Entries</h2>
      <RecordTable show="5"/>
    </div>
  );
}

function CreateRecordsContainer() {
  // container for buttons and create/modify records page
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


// main pages
function Home() {
  return (
    <main>
      <SectionHeader pageName="Home" />
      <Overview />
      <RecordsPreview />
      <CreateRecordsContainer />
    </main>
  );
}

function Records() {
  return (
    <main>
      <SectionHeader pageName="Records" />
        <RecordTable />
        <CreateRecordsContainer />
    </main>
  );
}

function Categories() {
  return (
    <main>
      <SectionHeader pageName="Categories" />
    </main>
  );
}

function Settings() {
  return (
    <main>
      <SectionHeader pageName="Settings" />
    </main>
  );
}

function App() {
  return (
  <StoreProvider store={store}>
    <InitialApiCalls />
    <div className="App">
      <Router>
        <Nav />
        <Switch>
          <Route path="/records">
            <Records />
          </Route>
          <Route path="/categories">
            <Categories />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  </StoreProvider>
  );
}

export default App;

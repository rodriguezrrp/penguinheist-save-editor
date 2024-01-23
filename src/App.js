// import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import FileAndSettingsForm from './components/FileAndSettingsForm';
import DowngradingInfo from './components/DowngradingInfo';
import PropsForm from './components/props/PropsForm';
import { SaveDataProvider } from './context/SaveDataContext';
import Card from './components/Card';
import QuickActions from './components/QuickActions';
import SaveDownloadButton from './components/SaveDownloadButton';

import Counter from './components/Counter';
import { VersionProvider } from './context/VersionContext';

function App() {
  // const [ version, setVersion ] = useState('');
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    <>
      <Counter />
      <VersionProvider>
        {/* <SaveDataProvider version={version}> */}
        <SaveDataProvider>
          <Card>
            {/* <FileAndSettingsForm version={version} setVersion={setVersion}/> */}
            <FileAndSettingsForm />
          </Card>
          <Card>
            <DowngradingInfo />
          </Card>
          <Card>
            <QuickActions />
            <PropsForm />
            <SaveDownloadButton />
          </Card>
        </SaveDataProvider>
      </VersionProvider>
    </>
  );
}

export default App;

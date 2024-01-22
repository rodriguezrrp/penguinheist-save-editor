// import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import FileAndSettingsForm from './components/FileAndSettingsForm';
import DowngradingInfo from './components/DowngradingInfo';
import PropsForm from './components/props/PropsForm';
import { SaveDataProvider } from './context/SaveDataContext';

function App() {
  const [ version, setVersion ] = useState('');
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
    <SaveDataProvider version={version}>
      <FileAndSettingsForm version={version} setVersion={setVersion}/>
      <DowngradingInfo />
      <PropsForm />
    </SaveDataProvider>
  );
}

export default App;

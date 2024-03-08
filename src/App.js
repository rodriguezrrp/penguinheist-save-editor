// import logo from './logo.svg';
import './App.css';
import FileAndSettingsForm from './components/FileAndSettingsForm';
import DowngradingInfo from './components/DowngradingInfo';
import PropsForm from './components/props/PropsForm';
import { SaveDataProvider } from './context/SaveDataContext';
import Card from './components/Card';
import QuickActions from './components/QuickActions';
import SaveDownloadButton from './components/SaveDownloadButton';

import { VersionProvider } from './context/VersionContext';
import { SliderWithCardIconClass } from './components/svgs/Icons';

function App() {
  // const [ version, setVersion ] = useState('');
  // const version = useVersion();
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
      <VersionProvider>
        {/* <SaveDataProvider version={version}> */}
        {/* <span style={{'font-weight': 'bold'}}>Version: "{version}"</span> */}
        <SaveDataProvider>
          {/* <PropListProvider> */}

            <Card>
              <h1>__&nbsp;Upload and Configure Save File(?)</h1>
              {/* <FileAndSettingsForm version={version} setVersion={setVersion}/> */}
              <FileAndSettingsForm />
            </Card>
            <Card>
              <h1>__&nbsp;Downgrading Info</h1>
              <DowngradingInfo />
            </Card>
            <Card>
              <h1><SliderWithCardIconClass />&nbsp;Edit Properties</h1>
              <QuickActions />
              <PropsForm />
              <SaveDownloadButton />
            </Card>
            
          {/* </PropListProvider> */}
        </SaveDataProvider>
      </VersionProvider>
    </>
  );
}

export default App;

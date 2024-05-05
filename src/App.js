// import logo from './logo.svg';
import './App.css';
import FileAndSettingsForm from './components/FileAndSettingsForm';
import DowngradingInfo from './components/DowngradingInfo';
import PropsForm from './components/props/PropsForm';
import { SaveDataProvider } from './context/SaveDataContext';
import { VersionProvider } from './context/VersionContext';
import { EditorStyleProvider } from './context/EditorStyleContext';
import Card from './components/Card';
import QuickActions from './components/QuickActions';
import SaveDownloadButtonRow from './components/SaveDownloadButtonRow';
import { ResetFileUploadInputProvider } from './context/ResetFileUploadInputContext';

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
          <EditorStyleProvider>
            <ResetFileUploadInputProvider>

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
                <h1>
                  <svg className="icon card-icon"
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    {/* fill-rule changed to fillRule for React */}
                    <path fillRule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z"/>
                  </svg>
                  &nbsp;Edit Properties
                </h1>
                <QuickActions />
                <SaveDownloadButtonRow />
                <PropsForm />
                <SaveDownloadButtonRow />
              </Card>
              
            </ResetFileUploadInputProvider>
          </EditorStyleProvider>
          {/* </PropListProvider> */}
        </SaveDataProvider>
      </VersionProvider>
    </>
  );
}

export default App;

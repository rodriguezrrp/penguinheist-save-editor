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
import { BsArrowCounterclockwise, BsController, BsFileEarmarkArrowUp, BsSliders } from 'react-icons/bs';
import { BadSaveDataProvider } from './context/BadSaveDataContext';

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
              <BadSaveDataProvider>

                <Card>
                  <h1>
                    <BsFileEarmarkArrowUp className="icon" />
                    &nbsp;Upload Save File
                  </h1>
                  {/* <FileAndSettingsForm version={version} setVersion={setVersion}/> */}
                  <FileAndSettingsForm />
                </Card>
                <Card>
                  <h1>
                    <BsController className="icon" />&nbsp;<BsArrowCounterclockwise className="icon" />
                    &nbsp;How to Download Older Versions
                  </h1>
                  <DowngradingInfo />
                </Card>
                <Card>
                  <h1>
                    <BsSliders className="icon" />
                    &nbsp;Edit Properties
                  </h1>
                  <QuickActions />
                  <SaveDownloadButtonRow />
                  <PropsForm />
                  <SaveDownloadButtonRow />
                </Card>
              
              </BadSaveDataProvider>
            </ResetFileUploadInputProvider>
          </EditorStyleProvider>
          {/* </PropListProvider> */}
        </SaveDataProvider>
      </VersionProvider>
    </>
  );
}

export default App;

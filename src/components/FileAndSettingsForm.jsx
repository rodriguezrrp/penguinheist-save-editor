import { useStoreSetAll } from "../context/SaveDataContext";
import { useSetVersion, useVersion } from "../context/VersionContext";
import { handleFileFormChange } from "../utils/saveFileEventUtils";


function FileAndSettingsForm({ version, setVersion }) {
  console.log('FileAndSettingsForm created, version:', version);
  return (
    <form id="fileForm" onChange={e => handleFileFormChange(e)}>
      <span>Todo: save file upload input and save settings here</span>
      {/* <input type="file" name="fileSelect" id="fileSelect"
          value="Upload Save" class="btn btn-outline-secondary --form-control w-100 h-100 file-select fw-600"
          aria-describedby="fileSelectDesc"
      ></input> */}
      <br/>

      <input type="file" name="fileSelect" id="fileSelect"
      ></input>

      <br/>
      <UploadButton />
      <br/>
      <TestSetEditorKeysButton />
      <br/>
      <VersionSelect />
    </form>
  );
}

function UploadButton() {
  // eslint-disable-next-line no-unused-vars
  // const [allData, setAllData] = useStoreSetAll(v => v);
  // eslint-disable-next-line no-unused-vars
  const [allData, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  console.log('UploadButton created');
  return (
    <button type="button" onClick={e => {
      setAllData({money: 700, stamps: 30});
    }}>
      manual setAll
    </button>
  );
}

function TestSetEditorKeysButton() {
  return (
    <button type="button" onClick={e => {
      ;
    }}>
      manual setEditorKeys
    </button>
  );
}

function VersionSelect() {
  const version = useVersion();
  const setVersion = useSetVersion();
  return (
  <>
    <button type="button" onClick={e => setVersion('vHH_initial')}>
      set version vHH_initial
    </button>
    <button type="button" onClick={e => setVersion('vCHP_latest')}>
      set version vCHP_latest
    </button>
    <span>(current version: {version})</span>
  </>
  );
}

export default FileAndSettingsForm;
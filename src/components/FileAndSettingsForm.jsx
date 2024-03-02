import { useState } from "react";
import { useStoreSetAll } from "../context/SaveDataContext";
import { useSetVersion, useVersion } from "../context/VersionContext";
import { getCompleteCategorizedSaveDataFor } from "../utils/saveDataUtils";
import { useSaveFileReader } from "../utils/saveFileEventUtils";
import { versionInfo } from "../data";
import SaveDownloadButton from "./SaveDownloadButton";


function FileAndSettingsForm({ version, setVersion }) {
  console.log('FileAndSettingsForm created, version:', version);
  // // eslint-disable-next-line no-unused-vars
  // const [allData, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  return (
    <form id="fileForm"
    // onChange={e => handleFileInputChange(e, (saveDataObj) => {
    //   console.log(categorizeSaveDataRecord(saveDataObj));
    //   setAllData(categorizeSaveDataRecord(saveDataObj));
    // })}
    >
      <span>Todo: save file upload input and save settings here</span>
      {/* <input type="file" name="fileSelect" id="fileSelect"
          value="Upload Save" class="btn btn-outline-secondary --form-control w-100 h-100 file-select fw-600"
          aria-describedby="fileSelectDesc"
      ></input> */}
      <br/>

      <FileInput />

      <br/>
      {/* <TestSetSaveDataButton /> */}
      {/* <br/>
      <TestSetEditorKeysButton /> */}
      <br/>
      <VersionSelect />
      <br/>
      <SaveDownloadButton />
    </form>
  );
}


function FileInput() {
  // eslint-disable-next-line no-unused-vars
  const [allData, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  console.log('FileInput created');
  
  const [file, setFile] = useState(null);
  
  const version = useVersion(); // creating dependency on version context

  const fileInputChangeHandler = (e) => {
    console.log('file input change handler');
    console.log(e.target.files[0]);
    const newFile = e.target.files[0];
    setFile(newFile);
  };

  useSaveFileReader(file, (saveDataMap) => {
    console.log('saveDataMap callback: received new saveDataMap:', saveDataMap);
    // setAllData(categorizeSaveDataRecord(saveDataMap));
    const categorized = getCompleteCategorizedSaveDataFor(version, saveDataMap);
    console.log(categorized);
    setAllData(categorized);
  }, version);

  return (
    <input type="file" name="fileSelect" id="fileSelect"
      // onChange={e => useHandleFileInputChange(e, (saveDataObj) => {
      //   const categorizedSaveDataObj = categorizeSaveDataRecord(saveDataObj);
      //   console.log(categorizedSaveDataObj);
      //   setAllData(categorizedSaveDataObj);
      // })}
      onChange={fileInputChangeHandler}
    ></input>
  );
}


let _foundSupportedVersionYet = false;
const versionOptions = Object.entries(versionInfo)
.filter(([version, info]) => !info.hideindropdown)
.map(([version, info]) => {
  const isFirstSupportedFound = (!_foundSupportedVersionYet && info.supported);
  _foundSupportedVersionYet = info.supported;
  const unsupported = !info.supported;
  return (
    <option
      disabled={unsupported}
      selected={isFirstSupportedFound}
      value={version}
    >
      {info.long_name || info.name}
      {unsupported && ' (unsupported)'}
      {isFirstSupportedFound && ' (latest supported)'}
    </option>
  );
});
versionOptions.unshift(
  <option value="">
    Unknown (assume all properties)
  </option>
)

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
    <select value={version} onChange={e => setVersion(e.target.value)}>
      {versionOptions}
    </select>
  </>
  );
}


export default FileAndSettingsForm;
import { useState } from "react";
import { useStoreGetAll, useStoreSetAll } from "../context/SaveDataContext";
import { useSetVersion, useVersion } from "../context/VersionContext";
import { decategorizeSaveData, getCompleteCategorizedSaveDataFor } from "../utils/saveDataUtils";
import { useSaveFileDownloader, useSaveFileReader } from "../utils/saveFileEventUtils";


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
      <TestSetSaveDataButton />
      {/* <br/>
      <TestSetEditorKeysButton /> */}
      <br/>
      <VersionSelect />
      <br/>
      <TestGetSaveDataButton />
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

function TestSetSaveDataButton() {
  // eslint-disable-next-line no-unused-vars
  const [allData, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  console.log('TestSetSaveDataButton created');
  return (
    <button type="button" onClick={e => {
      // setAllData({money: 700, stamps: 30});
      let saveDataObj = {money: 700, stamps: 30, nonexistentproperty: 200};
      // console.log(categorizeSaveDataRecord(saveDataObj));
      // setAllData(categorizeSaveDataRecord(saveDataObj));
    }}>
      manual setAll
    </button>
  );
}

// function TestSetEditorKeysButton() {
//   return (
//     <button type="button" onClick={e => {
//       console.log('todo');
//     }}>
//       manual setEditorKeys
//     </button>
//   );
// }
function TestGetSaveDataButton() {
  console.log('TestGetSaveDataButton created');
  const getAllData = useStoreGetAll();
  const [saveDataObj, setSaveDataObj] = useState(null);
  const filename = 'testfilename.sav';
  
  const version = useVersion(); // creating dependency on version context

  useSaveFileDownloader(saveDataObj, filename, version);

  return (
    <button type="button" onClick={e => {
      const allData = getAllData();
      console.log(allData);
      const decategorized = decategorizeSaveData(allData);
      console.log(decategorized);
      setSaveDataObj(decategorized);
    }}>
      manual getAll & download
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
import { useRef, useState } from "react";
import { useStoreGetAll, useStoreSetAll } from "../context/SaveDataContext";
import { useSetVersion, useVersion } from "../context/VersionContext";
import { combineSaveValuesConditionally, getCompleteCategorizedSaveDataFor } from "../utils/saveDataUtils";
import { useSaveFileReader } from "../utils/saveFileEventUtils";
import { versionInfo } from "../data";
import { useEditorStyle, useSetEditorStyle } from "../context/EditorStyleContext";
import { object_equals } from "../utils/comparisonUtils";
import { useResetFileUploadInput, useSetResetFileUploadInput } from "../context/ResetFileUploadInputContext";


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
      {/* <input type="file" name="fileSelect" id="fileSelect"
          value="Upload Save" class="btn btn-outline-secondary --form-control w-100 h-100 file-select fw-600"
          aria-describedby="fileSelectDesc"
      ></input> */}

      <label htmlFor="fileSelect">
        Upload Save File
      </label>
      <div className="upload-row">
        <FileInput />
        <FileResetBtn />
      </div>

      <VersionSelect />
      <PropertiesEditorOptions />
      {/* <SaveDownloadButtonRow /> */}
    </form>
  );
}


function FileInput() {
  console.log('FileInput created');
  const [, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  // used to check if changes will be overwritten
  const getAllData = useStoreGetAll();
  
  const [file, setFile] = useState(null);
  // const [prevFile, setPrevFile] = useState(file); // used for detecting if re-render was from the file changing
  const prevFileRef = useRef(file); // used for detecting if re-render was from the file changing
  const fileInputRef = useRef(null);
  const version = useVersion(); // creating dependency on version context
  const setResetFileUploadInput = useSetResetFileUploadInput(); // creating dependency on context
  setResetFileUploadInput(() => () => {
    fileInputRef.current.value = "";
  });
  

  const fileInputChangeHandler = (e) => {
    console.log('file input change handler');
    console.log(e.target.files[0]);
    const newFile = e.target.files[0];
    setFile(newFile);
  };

  useSaveFileReader(file, version, (saveDataMap) => {
    // Note: runs only when file exists and was decoded
    console.log('saveDataMap callback: received new saveDataMap:', saveDataMap);
    const categorizedDataWithFile = getCompleteCategorizedSaveDataFor(version, saveDataMap);
    console.log(categorizedDataWithFile);

    let fileChanged = (prevFileRef.current !== file);
    if(fileChanged) prevFileRef.current = file;

    if(fileChanged) {
      setAllData(categorizedDataWithFile);
    } else {
      // file did not change; therefore, e.g. version changed;
      // check if any property changes made by user might (unexpectedly!) be overwritten, and ask the user first
      const uneditedSaveData = getCompleteCategorizedSaveDataFor(version);
      const curData = getAllData();
      const isModifiedFromDefault = !object_equals(curData, uneditedSaveData);
      const newFileDataDifferent = !object_equals(curData, categorizedDataWithFile);
      // if there's modifications and new file data is different from it, ask before overwriting.
      // Note: if there's no modifications found, then new file data WILL OVERWRITE any differences without asking.
      const willOverwrite = newFileDataDifferent && isModifiedFromDefault;
      if(willOverwrite && window.confirm(
        'Do you want to overwrite any current changes with the uploaded save file\'s original content?'
      )) {
        setAllData(categorizedDataWithFile);
      }
    }
  });

  return (
    <input type="file" name="fileSelect" id="fileSelect"
      ref={fileInputRef}
      onChange={fileInputChangeHandler}
    ></input>
  );
}

function FileResetBtn() {
  console.log('FileResetBtn created');
  const [, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  const version = useVersion(); // creating dependency on version context
  const resetFileUploadInput = useResetFileUploadInput(); // creating dependency on context
  
  return (
    <button type="button" id="fileReset"
      onClick={(e) => {
        setAllData(getCompleteCategorizedSaveDataFor(version));
        resetFileUploadInput();
      }}
    >
      Reset to Default
    </button>
  );
}

function PropertiesEditorOptions() {
  console.log('PropertiesEditorOptions created');
  const editorStyle = useEditorStyle();
  const setEditorStyle = useSetEditorStyle();

  return <fieldset onChange={(e) => {setEditorStyle(e.target.value)}}>
    <legend>Property Editors Options:</legend>
    <div>
      <input
        type="radio" name="propFormOpts"
        id="optIndividual"
        value="individual"
        checked={editorStyle === "individual"}
      />
      <label htmlFor="optIndividual">Show Individual Editors Only</label>
    </div>
    <div>
      <input
        type="radio" name="propFormOpts"
        id="optSpecial"
        value="special"
        checked={editorStyle === "special"}
      />
      <label htmlFor="optSpecial">Show Specialized Editors</label>
    </div>
    <span>(debug: current style: {editorStyle})</span>
  </fieldset>;
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
        key={version}
        value={version}
      >
        {info.long_name || info.name}
        {unsupported && ' (unsupported)'}
        {isFirstSupportedFound && ' (latest supported)'}
      </option>
    );
  });
versionOptions.unshift(
  <option key="" value="">
    Any (assume all properties)
  </option>
)

function VersionSelect() {
  const version = useVersion();
  const setVersion = useSetVersion();
  
  // used for preserving whatever state may be in the form currently
  const [, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  const getAllData = useStoreGetAll();
  
  return (
  <>
    <button type="button" onClick={e => setVersion('vHH_initial')}>
      set version vHH_initial
    </button>
    <button type="button" onClick={e => setVersion('vCHP_latest')}>
      set version vCHP_latest
    </button>
    <span>(current version: {version})</span>
    <br/>
    <label>
      Version:&nbsp;
      <select value={version} onChange={e => {
        let prevVersion = version;
        let newVersion = e.target.value;
        setVersion(newVersion);

        let prevVersionUneditedSaveData = getCompleteCategorizedSaveDataFor(prevVersion);
        let curData = getAllData();
        let wasUnedited = object_equals(curData, prevVersionUneditedSaveData);
        console.log('VersionSelect updating: wasUnedited:', wasUnedited);
        if(wasUnedited) {
          // ONLY if NO edits have been made, OVERWRITE save data in form with new data for this version
          setAllData(getCompleteCategorizedSaveDataFor(newVersion));
        } else {
          // combine in the new data while keeping all non-empty values that already exist (ex. they may have been edits).
          // in other words, applying the new relevants, and discarding old values including old relevants unless they contain values
          setAllData(combineSaveValuesConditionally(getCompleteCategorizedSaveDataFor(newVersion), curData))
        }
      }}>
        {versionOptions}
      </select>
    </label>
  </>
  );
}


export default FileAndSettingsForm;
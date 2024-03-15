import { useState } from "react";
import { useStoreGetAll } from "../context/SaveDataContext";
import { useVersion } from "../context/VersionContext";
import { decategorizeSaveData } from "../utils/saveDataUtils";
import { useSaveFileDownloader } from "../utils/saveFileEventUtils";

const filename = 'PHSaveMain.sav';

export default function SaveDownloadButtonRow() {
  console.log('TestGetSaveDataButton created');
  const getAllData = useStoreGetAll();
  const [saveDataObjForDL, setSaveDataObjForDL] = useState(null);

  const version = useVersion(); // creating dependency on version context

  useSaveFileDownloader(saveDataObjForDL, filename, version);

  return (
    <div className="download-button-row">
      <button type="button" style={{height: "2em"}} onClick={e => {
        const allData = getAllData();
        console.log(allData);
        const decategorized = decategorizeSaveData(allData);
        console.log(decategorized);
        setSaveDataObjForDL(decategorized);
      }}>
        Download as Save File
      </button>
    </div>
  );
}

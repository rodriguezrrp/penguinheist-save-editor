
import { useEffect } from "react";
import { decodeSaveFile, encodeSaveFile } from "./saveFileEncodingUtils.mjs";
import fileDownload from "js-file-download";

// export function handleFileFormChange(e, dataObjCallback) {
//     //
//     console.log('handleFileFormChange: e:', e);
//     console.log('handleFileFormChange: e.target.files:', e.target.files);
// }

/**
 * 
 * @param {any} file
 * @param {string?} version
 * @param {(dataMap: Map<string, string>, badLines: {badline: (string|any), parts?: string[]}[]) => void} saveDataMapCallback 
 */
export function useSaveFileReader(file, version, saveDataMapCallback) {
    //
    // console.log('handleFileFormChange: e:', e);
    // console.log('handleFileFormChange: e.target.files:', e.target.files);
    //
    // dataObjCallback(saveDataObj);
    useEffect(() => {
        console.log('in reader useEffect: file:', file);
        console.log('in reader useEffect: version:', version);
        let fileReader, isCancel = false;
        if (file) {
            fileReader = new FileReader();
            fileReader.onload = (e) => {
                const contents = e.target.result;
                if(contents && !isCancel) {
                    const badLines = [];
                    const badLineHandler = (badLine, parts) => {
                        console.error('Bad line found:', badLine);
                        badLines.push({badline: badLine, parts: parts});
                        return true;
                    }
                    const dataMap = decodeSaveFile(contents, version, badLineHandler);
                    if(badLines.length !== 0) {
                        alert(`Warning: ${badLines.length} unreadable lines found in save file!`);
                    }
                    saveDataMapCallback(dataMap, badLines);
                }
            }
            fileReader.onerror = (e) => {
                console.error(`error encountered reading file: ${e.target.error.name}`);
                alert(`error encountered reading file: ${e.target.error.name}`);
                console.error(e.target.error);
            }
            fileReader.readAsText(file);
        }
        return () => {
            isCancel = true;
            if(fileReader && fileReader.readyState === 1) {
                fileReader.abort();
            }
        };
    }, [file, saveDataMapCallback, version]);
}

// function parseSaveInto(contents, newSaveDataMap, version) {
//     // parse save into newSaveDataMap mapping.
//     const lines = contents.split(/\r?\n/);
//     lines.forEach((line) => {
//         if(line === '') return; // skip empty lines
//         const parts = line.split('@');

//         if(!parts || parts.length !== 3 || parts[0] !== '' || parts[1] === '')
//             console.warn(`Skipping line with unexpected formatting: "${line}"`);

//         const fullKey = parts[1], val = parts[2];
//         newSaveDataMap.set(fullKey, val);
//     });
// }

export function useSaveFileDownloader(saveDataObj, filename, version) {
    useEffect(() => {
        // console.log('in dl useEffect: filename:', filename);
        // console.log('in dl useEffect: version:', version);
        // console.log('in dl useEffect: saveDataObj:', saveDataObj);
        // let isCancel = false;
        // let blob, elem, url;
        if(saveDataObj) {
            const blobStr = encodeSaveFile(Object.entries(saveDataObj), version);
            fileDownload(blobStr, filename, 'text/*');
        }
        return () => {
            // isCancel = true;
        }
    }, [saveDataObj, filename, version]);
}

// function encodeSavePropsDataToBlob(savePropsMap, version) {
//     // currently all versions use the same plaintext format!
//     let data = '';
//     for(const [fullKey, value] of Array.from(savePropsMap)) {
//         // Note: ALLOWING empty string '', for lists such as previousLoadout
//         if(typeof(value) === "undefined" || value === null) {
//             continue;
//         }
//         data += `@${fullKey}@${value}\n`;
//     }
//     return new Blob([data], {type: 'text/*'});
// }

// function provideFileDL(saveBlob, filename) {
//     // const blob = new Blob([data], {type: 'text/csv'});
//     const blob = saveBlob;
//     if(blob.constructor.name !== 'Blob') {
//         console.error('provideFileDL: save blob was not an instance of Blob? Aborting download setup.');
//         alert('Problem with saving to file. See console for more.');
//         return false;
//     }
//     if(window.navigator.msSaveOrOpenBlob) {
//         window.navigator.msSaveBlob(blob, filename);
//     }
//     else {
//         const elem = window.document.createElement('a');
//         // let url = window.URL.createObjectURL(blob);
//         let url = window.URL.createObjectURL(blob, { oneTimeOnly: true });
//         elem.href = url;
//         elem.download = filename;
//         document.body.appendChild(elem);
//         elem.click();
//         document.body.removeChild(elem);
//         window.URL.revokeObjectURL(url);
//     }
// }

// function doDownloadPrimary() {
//     // version saveType1.
//     let version = $('#saveType1').val();
//     // use filename of save file imported, or default to normal save name.
//     let filename = document.getElementById('fileSelect').files[0]?.name ?? 'PHSaveMain.sav';
//     provideFileDL(encodeSavePropsDataToBlob(currentSaveData, version), filename);
// }
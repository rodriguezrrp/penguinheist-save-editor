

// function readImage(file) {
//     // Check if the file is an image.
//     if (file.type && !file.type.startsWith('image/')) {
//         console.log('File is not an image.', file.type, file);
//         return;
//     }

//     const reader = new FileReader();
//     reader.addEventListener('load', (event) => {
//         img.src = event.target.result;
//     });
//     reader.readAsDataURL(file);
// }


function readFile(fileSelectVal, version) {
    console.log('readFile: fileSelectVal:', fileSelectVal);
    if(!fileSelectVal) return new Map();
    // check if the file is a save file
    const filetype = fileSelectVal.type;
    const filename = fileSelectVal.name;
    if(filetype !== '' || !filename.endsWith('.sav'))
        console.warn(`readFile(): file "${filename}" of type "${filetype}" might not be a save file. Will still attempt to read it as such.`)

    // could try to determine version here...
    // if(!version) { ... }

    const newSaveDataMap = new Map();
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const contents = e.target.result;
        // perform param or property parsing according to version selected
        // if(version)
            // currently not version-specific!
            parseSaveInto(contents, newSaveDataMap, version);
    };
    reader.onerror = (e) => {
        alert(`readFile(): error encountered reading file: ${e.target.error.name}`);
    }
    reader.readAsText(fileSelectVal);
    
    console.log('readFile: newSaveDataMap:', newSaveDataMap);

    return newSaveDataMap;
}

function parseSaveInto(contents, newSaveDataMap, version) {
    // parse save into newSaveDataMap mapping.
    const lines = contents.split(/\r?\n/);
    lines.forEach((line) => {
        if(line === '') return; // skip empty lines
        const parts = line.split('@');

        if(!parts || parts.length != 3 || parts[0] !== '' || parts[1] === '')
            console.warn(`Skipping line with unexpected formatting: "${line}"`);

        const fullKey = parts[1], val = parts[2];
        newSaveDataMap.set(fullKey, val);
    });
}

function provideFileDL(savePropsData, filename) {
    // const blob = new Blob([data], {type: 'text/csv'});
    const blob = new Blob([data], {type: ''});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const elem = window.document.createElement('a');
        // let url = window.URL.createObjectURL(blob);
        let url = window.URL.createObjectURL(blob, { oneTimeOnly: true });
        elem.href = url;
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
        window.URL.revokeObjectURL(url);
    }
}



// for toggling collapsible divs
// function toggleIcon(event) {
//     $(event.target)
//         .prev('.save-data-collapse-bar')
//         .find('i')
//         .toggleClass('bi-caret-right-fill bi-caret-down-fill');
// }



// returns save data that is default for the game version
function defaultSaveFor(version) {
    return a;
}


// main function to repopulate
function repopulateParamsForm(version, saveData) {
    console.log('version:', version);
    console.log('saveData:', saveData);
    //
}


// called at beginning of form load to
// fill in defaults & info from the JSON files
function initializeParamsForm() {
    console.log('initializeForm called');
    //
}



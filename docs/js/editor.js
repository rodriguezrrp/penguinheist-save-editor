

function readImage(file) {
    // Check if the file is an image.
    if (file.type && !file.type.startsWith('image/')) {
        console.log('File is not an image.', file.type, file);
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        img.src = event.target.result;
    });
    reader.readAsDataURL(file);
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



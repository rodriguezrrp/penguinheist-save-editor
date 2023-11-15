

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

const DEPOTS_INFO = {
    'depot_windows': 1451481,
    'depot_macos': 1451482,
    'depot_linux': 1451483,
}

const VERSION_INFO = {
    'vCHP5': {
        'name': 'Patch + Cosmetics + Heist Planner Update, Patch 5',
        'supported': true,
        'manifest_windows': '6080836104571247089',
        'manifest_macos': '6696505757018614311',
        'manifest_linux': '994994544851264338',
    },
    'vCHP': {
        'name': 'Patch + Cosmetics + Heist Planner Update',
        'supported': true,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vEV': {
        'name': 'Enemies + Vehicles Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vHR': {
        'name': 'Heist Reworks Update Rollback',
        'supported': false,
        'manifest_windows': '9136054215769811295',
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vHRP': {
        'name': 'Heist Reworks Preview',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vOM4': {
        'name': 'Optimization Madness Patch 4',
        'long_name': 'Optimization Madness Update, Patch 4',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vOM': {
        'name': 'Optimization Madness Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vGS3': {
        'name': 'Graphics+Maps+Noots, Spr Patch 3',
        'long_name': 'Graphics + Maps + Noots, Spring Patch 3',
        'supported': true,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vGS2': {
        'name': 'Graphics+Maps+Noots, Spr Patch 2',
        'long_name': 'Graphics + Maps + Noots, Spring Patch 2',
        'supported': true,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vGS2': {
        'name': 'Graphics+Maps+Noots Update',
        'long_name': 'Graphics + Maps + Noot Variations Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vJ': {
        'name': 'January Update',
        'supported': true,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vP': {
        'name': 'Post Office Update',
        'supported': true,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vW': {
        'name': 'Winter Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vBP': {
        'name': 'Blueprint Update',
        'supported': true,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    },
    'vPBP': {
        'name': 'pre-Blueprint Update',
        'supported': false,
        'manifest_windows': undefined,
        'manifest_macos': undefined,
        'manifest_linux': undefined,
    }
}


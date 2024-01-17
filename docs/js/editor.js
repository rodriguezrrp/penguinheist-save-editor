
function readFile(fileSelectVal, version, onFileLoadCallback) {
    console.log('readFile: fileSelectVal:', fileSelectVal);
    if(!fileSelectVal) return new Map();
    // check if the file is a save file
    const filetype = fileSelectVal.type;
    const filename = fileSelectVal.name;
    if(filetype !== '' || !filename.endsWith('.sav'))
        console.warn(`readFile: file "${filename}" of type "${filetype}" might not be a save file. Will still attempt to read it as such.`)

    // could try to determine version here...
    // if(!version) { ... }

    const newSaveDataMap = new Map();
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const contents = e.target.result;
        // console.log(contents);
        // perform param or property parsing according to version selected
        // if(version)
            // currently not version-specific!
            parseSaveInto(contents, newSaveDataMap, version);
        // calling an updater in here because the reader.onload does not appear to be synchronous/blocking
        onFileLoadCallback(newSaveDataMap);
    };
    reader.onerror = (e) => {
        alert(`readFile: error encountered reading file: ${e.target.error.name}`);
    }
    reader.readAsText(fileSelectVal);
    
    console.log('readFile: newSaveDataMap:', newSaveDataMap);

    // return newSaveDataMap;
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

function encodeSavePropsDataToBlob(savePropsMap, version) {
    // currently all versions use the same plaintext format!
    data = '';
    for(const [fullKey, value] of Array.from(savePropsMap)) {
        if(typeof(value) === "undefined" || value === null) {
            continue;
        }
        data += `@${fullKey}@${value}\n`;
    }
    return new Blob([data], {type: 'text/*'});
}

function provideFileDL(saveBlob, filename) {
    // const blob = new Blob([data], {type: 'text/csv'});
    const blob = saveBlob;
    if(blob.constructor.name !== 'Blob') {
        console.error('provideFileDL: save blob was not an instance of Blob? Aborting download setup.');
        alert('Problem with saving to file. See console for more.');
        return false;
    }
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

function doDownloadPrimary() {
    // version saveType1.
    let version = $('#saveType1').val();
    // use filename of save file imported, or default to normal save name.
    let filename = document.getElementById('fileSelect').files[0]?.name ?? 'PHSaveMain.sav';
    provideFileDL(encodeSavePropsDataToBlob(currentSaveData, version), filename);
}
function doDownloadConverted() {
    // version saveType2.
    let version = $('#saveType2').val();
    if(!version) {
        alert('No comparison/conversion version selected!');
        return;
    }
    // use filename of save file imported, or default to normal save name.
    let filename = document.getElementById('fileSelect').files[0]?.name ?? 'PHSaveMain.sav';
    provideFileDL(encodeSavePropsDataToBlob(currentSaveData, version), filename);
}

function doResetToDefault() {
    // empty file input
    document.getElementById('fileSelect').value = null;
    // empty all current data
    currentSaveData = new Map();
    // refresh form; it will draw upon defaults
    refreshParamsInForm();
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


// // main function to repopulate
// function repopulateParamsForm(version, saveData) {
//     console.log('version:', version);
//     console.log('saveData:', saveData);
//     //
// }


// // called at beginning of form load to
// // fill in defaults & info from the JSON files
// function initializeParamsForm() {
//     console.log('initializeForm called');
//     //
// }

const _unknown_manifest = '<span style="color:red">info-not-gathered</span>';
const _unknown_depot = '<span style="color:red">missing-depot-info</span>';

var paramsFormTooltipList = [];
var paramsFormTomSelectList = [];
var currentSaveData = undefined;


function attemptOpenAccordionFromWindowHash() {
    // if anchor link going to an accordion's header, try to open the accordion
    var hash = window.location.hash;
    if(hash) {
        let element = $(hash);
        console.log(element);
        if (element.length) {
            let accordionbutton;
            if (element.hasClass('accordion')) {
                // element.trigger('click');
                accordionbutton = element.find('div>div>button');
            } else if(element.is('h1') || element.is('h2') || element.is('h3') || element.is('h4') || element.is('h5') || element.is('h6')) {
                let accordionidentifier = element.attr('accordion-identifier');
                console.log(accordionidentifier);
                accordionbutton = $(`${accordionidentifier}.accordion>div>div>button`);
                console.log(accordionbutton);
            }
            if(accordionbutton && accordionbutton.length && accordionbutton.hasClass('collapsed')) {
                accordionbutton.trigger('click');
            }
        }
    }
}

function populateVersionDropdowns() {
    const selectSaveType1 = $('#saveType1');
    const selectSaveType2 = $('#saveType2');
    var options1 = '<option value="">Unknown (assume all values)</option>';
    var options2 = '<option value="" selected>None selected</option>';
    var foundSupported = false;
    var i = 0;
    for(const [key, val] of Object.entries(VERSION_INFO)) {
        if(val.hideindropdown) continue;
        let name = val.name;
        let long_name = val.long_name ?? name;
        let supported = val.supported;
        options1 += `<option ${!supported?'disabled ':''}value="${key}"${(!foundSupported&&supported)?' selected':''}>
            ${long_name}${i===0?' (latest)':''}${!supported?(' (format unsupported)'):''}
            </option>`;
        options2 += `<option ${!supported?'disabled ':''}value="${key}">
            ${long_name}${i===0?' (latest)':''}${!supported?(' (format unsupported)'):''}
            </option>`;
        foundSupported ||= supported;
        i++;
    }
    console.log(options1);
    selectSaveType1.empty().append(options1);
    selectSaveType2.empty().append(options2);
}
function populateManifestTable() {
    const tableBody = $('#tableManifests').find('tbody');
    var rows = '';
    for(const pair of Object.entries(VERSION_INFO)) {
        let key = pair[0]; let val = pair[1];
        let name = val.name;
        let long_name = val.long_name ?? name;
        rows += `<tr>
            <td>${long_name ?? _unknown_manifest}</td>
            <td>${val.manifest_windows ?? _unknown_manifest}</td>
            <td>${val.manifest_macos ?? _unknown_manifest}</td>
            <td>${val.manifest_linux ?? _unknown_manifest}</td>
            </tr>`;
    }
    tableBody.empty().append(rows);
}

function updateGameVersionInfoOnPage(event, version) {
    // var version = $('#saveType1').val();
    console.log('updateGameVersionInfoOnPage', version);
    // if(!VERSION_INFO[version] || !VERSION_INFO[version].supported) {
    //     return;
    // }
    versionInfo = VERSION_INFO[version] ?? {name:'Unknown'};
    let long_name = versionInfo.long_name ?? versionInfo.name;
    // $('.game-version-name').html('alphabet'+version);
    // $('.game-version-manifest').html('alphabet');
    $('.game-version-name').html(long_name);
    $('.game-version-manifest-windows').html(versionInfo.manifest_windows ?? _unknown_manifest);
    $('.game-version-manifest-macos').html(versionInfo.manifest_macos ?? _unknown_manifest);
    $('.game-version-manifest-linux').html(versionInfo.manifest_linux ?? _unknown_manifest);
    $('.game-version-depot-windows').html(versionInfo.depot_windows ?? DEPOTS_INFO.depot_windows ?? _unknown_depot);
    $('.game-version-depot-macos').html(versionInfo.depot_macos ?? DEPOTS_INFO.depot_macos ?? _unknown_depot);
    $('.game-version-depot-linux').html(versionInfo.depot_linux ?? DEPOTS_INFO.depot_linux ?? _unknown_depot);
}


// Short-circuiting, and saving a parse operation
function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

// https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
} 
function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

// TODO: do test cases on this function!
console.error('TODO: do test cases on _isValidVersion!');
function _isValidVersion(v) {
    return VERSION_INFO.hasOwnProperty(v);
}

// TODO: do test cases on this function!
console.error('TODO: do test cases on compareVersion!');
function compareVersion(v1, v2) {
    // if([v1, v2].some(v=>!_isValidVersion(v))) {
    //     let _failedVs = (_isValidVersion(v1)?[]:['v1']).concat(_isValidVersion(v2)?[]:['v2']);
    //     throw new TypeError(`compareVersion: ${_failedVs.join(', ')} must be valid version ids!`);
    // }
    if(!_isValidVersion(v1)) {
        console.info(`compareVersion: v1 "${v1}" was not a valid version id!`);
        return null;
    }
    if(!_isValidVersion(v2)) {
        console.info(`compareVersion: v2 "${v2}" was not a valid version id!`);
        return null;
    }
    let diff = VERSION_INFO[v1].steamdb_buildid - VERSION_INFO[v2].steamdb_buildid;
    if(isNaN(diff)) {
        // let _missingBID = (VERSION_INFO[v1].steamdb_buildid?[]:['v1']).concat(VERSION_INFO[v2].steamdb_buildid?[]:['v2']);
        // throw new Error(`compareVersion: ${_missingBID.join(', ')} must have a valid steamdb_buildid property in VERSION_INFO!`);
        if(!(VERSION_INFO[v1].steamdb_buildid))
            console.info(`compareVersion: v1 "${v1}" did not have a valid steamdb_buildid property in VERSION_INFO!`);
        if(!(VERSION_INFO[v2].steamdb_buildid))
            console.info(`compareVersion: v2 "${v2}" did not have a valid steamdb_buildid property in VERSION_INFO!`);
        return null;
    }
    return diff;
}

function getMaxLoadoutSize(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // compareVersion returns positive when the first version is later than the second version.
    // therefore, when version is Post Office or later, the loadout size is 8. That's when it was upgraded.
    return compareVersion(version, 'vP') >= 0 ? 8 : 6;
}

function versionHasStamps(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // stamps were introduced in Post Office update
    return compareVersion(version, 'vP') >= 0;
}

function versionHasStructures(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // structures were replaced with blueprints in Blueprint update
    return compareVersion(version, 'vBP') < 0;
}

function versionHasLockableHeists(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // heists became progression-locked in the Heist Planner patch update
    return compareVersion(version, 'vCHP_initial') >= 0;
}

function refreshQuickActionAvailabilities(version1, version2) {
    let hasStamps1 = versionHasStamps(version1);
    let hasStamps2 = versionHasStamps(version2);
    if(hasStamps1 === true || hasStamps2 === true)
        document.getElementById('quickActStamps').removeAttribute('disabled');
    else
        document.getElementById('quickActStamps').setAttribute('disabled', 'true');
    let hasStructures1 = versionHasStructures(version1);
    let hasStructures2 = versionHasStructures(version2);
    if(hasStructures1 === true || hasStructures2 === true)
        document.getElementById('quickActStructures').removeAttribute('disabled');
    else
        document.getElementById('quickActStructures').setAttribute('disabled', 'true');
    let hasLockableHeists1 = versionHasLockableHeists(version1);
    let hasLockableHeists2 = versionHasLockableHeists(version2);
    if(hasLockableHeists1 === true || hasLockableHeists2 === true)
        document.getElementById('quickActHeists').removeAttribute('disabled');
    else
        document.getElementById('quickActHeists').setAttribute('disabled', 'true');
}

const SAVE_COL_PATTERN = /^((0(\.\d+)?|1);){3}(0(\.\d+)?|1)$/g;
const HEX_COL_PATTERN = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/gi;

// FWIW: according to UnityEngine.Color32, conversion between 0-255 and 0-1 is done by dividing and multiplying by 255.
// #000000  <==>  0;0;0;1
// #ffffff  <==>  1;1;1;1
function saveToHex(saveCol) {
    if(!saveCol.match(SAVE_COL_PATTERN)) return null;
    let rgbaArr = saveCol.split(';');
    let res = '#' + rgbaArr.map(n => (Math.round(parseFloat(n)*255)).toString(16)).map(n => n.length == 1 ? '0'+n : n).join('');
    // trim off alpha part of #rrggbbaa if alpha was 1 as in x;x;x;1
    return res.length == 9 && res.endsWith('ff') ? res.substring(0, 7) : res;
}
function hexToSave(hexCol) {
    if(!hexCol.match(HEX_COL_PATTERN)) return null;
    let rgbaArr = HEX_COL_PATTERN.exec(hexCol).slice(1);
    return rgbaArr.map(n => n === undefined ? '1' : (parseInt(n,16)/255).toPrecision(8).replaceAll(',','.').replaceAll(/\.?0+$/g,'')).join(';');
}

function addIntlistElem(intlistColElem, fullKeyNoSpaces, intlistChangeCallback, intlistDeleteCallback, initVal, dropdownValues) {
    const lindex = intlistColElem.children.length-1;
    // add new value to column's intlist property
    initVal = (initVal===null || typeof(initVal)==="undefined")
                ? '' : initVal;
    intlistColElem.intlist.push(initVal.toString());

    // create containing row div
    // Note: the list index for this item is stored as a property of this .intlist-item-row element.
    const newItemRowElem = Object.assign(
        document.createElement('div'),
        // { className: 'row mb-2 intlist-item-row' });
        { className: 'row mb-2 intlist-item-row', listindex: lindex });
    // create children elements
    if(!dropdownValues) {
        // just number inputs
        const _itemInput = Object.assign(
            document.createElement('input'),
            { className: 'form-control', type: 'number',
            // listindex: lindex, value: initVal }
            value: initVal }
        );
        _itemInput.addEventListener('change', (e) => {
            console.log(intlistColElem.intlist);
            // intlistColElem.intlist[e.target.listindex] = e.target.value;
            intlistColElem.intlist[e.target.closest('.intlist-item-row').listindex] = e.target.value;
            console.log(intlistColElem.intlist);
            intlistChangeCallback(e);
        });
        const _itemInputCol = Object.assign(
            document.createElement('div'), { className: 'col' }
        );
        _itemInputCol.append(_itemInput);
        newItemRowElem.append(_itemInputCol);
    } else {
        // dropdowns
        const _itemSelect = Object.assign(
            document.createElement('select'),
            { className: 'mw-100', placeholder: 'Type to search value...',
            autocomplete: 'off', value: initVal }
        );
        // add <option> s
        for (const [optionValue, optionContents] of Object.entries(dropdownValues)) {
            const _optionElem = Object.assign(
                document.createElement('option'),
                { value: optionValue, innerHTML: optionContents }
            );
            _itemSelect.append(_optionElem);
        }
        const _itemInputCol = Object.assign(
            document.createElement('div'), { className: 'col' }
        );
        _itemInputCol.append(_itemSelect);
        newItemRowElem.append(_itemInputCol);

        // setup TomSelect for searching options
        let tomselect = new TomSelect(_itemSelect, {
            create: false,
            sortField: {
                field: "text"
                // direction: "asc"
            }
            , maxOptions: null  // default was 50; this will allow ALL <option> s to show
        });
        paramsFormTomSelectList.push(tomselect);
        _itemSelect.addEventListener('change', (e) => {
            console.log(intlistColElem.intlist);
            // intlistColElem.intlist[e.target.listindex] = e.target.value;
            intlistColElem.intlist[e.target.closest('.intlist-item-row').listindex] = e.target.value;
            console.log(intlistColElem.intlist);
            intlistChangeCallback(e);
        });
    }
    const _delBtn = Object.assign(
        document.createElement('button'),
        { className: "btn btn-outline-secondary h-100 py-0 px-2 border-0",
        type: 'button', title: "Erase item from list parameter",
        listindex: lindex }
    )
    _delBtn.setAttribute('aria-label', "Erase item from list parameter");
    _delBtn.append(Object.assign(
        document.createElement('i'), { className: 'fs-5 bi-trash-fill' }
    ));
    const _delBtnCol = Object.assign(
        document.createElement('div'), { className: 'col col-auto' }
    );
    _delBtnCol.append(_delBtn);
    newItemRowElem.append(_delBtnCol);

    // add row into column
    intlistColElem.insertBefore(newItemRowElem, intlistColElem.lastChild);
    // handle removal of this item's editor
    _delBtn.onclick = (e) => {
        let enclosingIntlistItemRow = e.target.closest('.intlist-item-row');
        intlistColElem.intlist.splice(
            // get input of the same row
            // enclosingIntlistItemRow.querySelector('input').listindex,
            enclosingIntlistItemRow.listindex,
            1);
        // decrement listindex of all other inputs following this one, to fit with the splice above.
        let _rowelem = enclosingIntlistItemRow.nextSibling;
        while(_rowelem.classList.contains('intlist-item-row')) {
            // get input of the row
            // _rowelem.querySelector('input').listindex--;
            _rowelem.listindex--;
            // move to the next row
            _rowelem = _rowelem.nextSibling;
        }
        // now remove this element
        // remove TomSelect if it exists
        let tomselect = enclosingIntlistItemRow.querySelector('select').tomselect;
        if(tomselect) {
            tomselect.destroy();
            let i = paramsFormTomSelectList.indexOf(tomselect);
            if(i > -1)
                paramsFormTomSelectList.splice(i, 1);
        }
        // newItemRowElem.remove();
        // fully remove the element from the DOM
        enclosingIntlistItemRow.remove();
        // let the callback know it was removed, to handle other stuff (such as updating the value in currentSaveData)
        intlistDeleteCallback(e);
    }

    // fire change listener to apply any initVal it may have immediately to the intlist (as if it was manually selected)
    if(!dropdownValues) {
        newItemRowElem.querySelector('input').dispatchEvent(new Event('change', { bubbles: true }))
    } else {
        newItemRowElem.querySelector('select').dispatchEvent(new Event('change', { bubbles: true }))
    }
}

function resolveDropdown_nameMapIfNeeded(dropdownMapResult) {
    /* If the result's .values is an array instead of an object (mapping),
        create an object (mapping) from the array using the name map to make key-value pairs.
        Otherwise, return the .values ?? {}.
    */
    if(Array.isArray(dropdownMapResult.values)) {
        // there should be a name_map specified
        const valuesNameMap = dropdownMapResult.name_map;
        let nameMap = null;
        switch (valuesNameMap) {
            case "item":
                nameMap = NAME_MAP_ITEMS;
                break;
            case "clothing":
                nameMap = NAME_MAP_CLOTHING;
                break;
            default:
                console.error(`resolveDropdown_nameMapIfNeeded(): Unknown name map "${valuesNameMap}" referenced! Defaulting to null.`)
                nameMap = null;
                break;
        }
        if(nameMap === null)
            return {};
        // convert each value into a key-value pair
        return Object.fromEntries(dropdownMapResult.values.map((value) => [value, nameMap[value].name]));
    } else {
        return dropdownMapResult.values ?? {};
    }
}

function resolveDropdown(dropdownRefName, saveType1, saveType2) {
    console.log('resolveDropdown');
    let dropdownMap = DROPDOWN_MAPS[dropdownRefName];
    if(!dropdownMap) return {};
    if(!dropdownMap.version_dependent) {
        return dropdownMap.values;
    }
    // handle version-dependent. Can involve inheritance, etc.
    let vals1 = {};
    let vals2 = {};
    console.log('versions:', saveType1, saveType2);
    if(saveType1) {
        let version = saveType1;
        vals1 = resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {};
        // add in values from the chain of inheritance
        while(dropdownMap[version].inherit) {
            version = dropdownMap[version].inherit;
            // newest should override in the inheritance chain (newest is values already found)
            vals1 = {...resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {}, ...vals1};
        }
    }
    console.log('vals1', vals1);
    if(saveType2) {
        let version = saveType2;
        vals2 = resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {};
        // add in values from the chain of inheritance
        while(dropdownMap[version].inherit) {
            version = dropdownMap[version].inherit;
            // newest should override in the inheritance chain (newest is values already found)
            vals2 = {...resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {}, ...vals2};
        }
    }
    console.log('vals2', vals2);
    return {...vals2, ...vals1}; // primary save's version overrides any duplicates from comparison's version
}

function cleanupTooltipsAndTomSelects() {
    paramsFormTooltipList.forEach(tooltip => tooltip.dispose());
    paramsFormTooltipList = [];
    paramsFormTomSelectList.forEach(tomselect => tomselect.destroy());
    paramsFormTomSelectList = [];
}

function createParamsFormCollapses() {
    const formBody = $('#saveForm');
    // cleanup any old tooltips and tomselects before emptying form
    cleanupTooltipsAndTomSelects();

    formBody.empty();

    // setup property category dropdowns (collapses)
    var propCollapses = '';
    for (const [categoryKey, catInfo] of Object.entries(CATEGORY_INFO)) {
        let name = catInfo.name;
        let expanded = catInfo.expanded ?? false;
        propCollapses += `<!-- accordion item (header button + collapsible content) -->
        <div class="--col-12 accordion accordion-flush">
            <div class="row accordion-item">
                <div class="px-0 accordion-header">
                    <button class="accordion-button save-data-collapse-bar ${expanded ? '' : 'collapsed'}" aria-expanded="${expanded ? 'true' : 'false'}"
                    type="button" data-bs-toggle="collapse" data-bs-target="#propCollapse-${categoryKey}" aria-controls="propCollapse-${categoryKey}"
                    >
                    <span class="visually-hidden">Properties category for</span><span>${name}</span>
                    </button>
                </div>

                <div id="propCollapse-${categoryKey}" class="accordion-collapse collapse ${expanded ? 'show' : ''}">
                `
                // empty; gets populated below
                +`
                </div>
            </div>
        </div>`
    }
    // formBody.append(propCollapses);
    formBody.append(propCollapses);
}

function emptyParamsFormCollapses() {
    cleanupTooltipsAndTomSelects();
    const collapseBodies = document.getElementById('saveForm').querySelectorAll('div.accordion-collapse');
    // console.log('collapseBodies.length:', collapseBodies.length);
    collapseBodies.forEach((collapseBodyElem) => {
        $(collapseBodyElem).empty();
    })
}

function fillParamsForm(saveType1, saveType2, showRelevantOptions, showRawEditors, /*mappedPropInfoDict,*/ fileValuesMap) {
    // createParamsFormCollapses();
    emptyParamsFormCollapses();

    // $('.prop-collapse').on('hidden.bs.collapse',toggleIcon);
    // $('.prop-collapse').on('shown.bs.collapse',toggleIcon);
    

    // if the first save version is not specified, just use all known properties
    const propMapRelevant1 = !saveType1 ? VERSION_RELEVANTS['all'] : VERSION_RELEVANTS[saveType1];
    // if no comparison save version, then don't have a comparison map
    const propMapRelevant2 = !saveType2 ? {} : VERSION_RELEVANTS[saveType2];
    // if no file was put in, we should fall back to default for the selected version
    // fileValuesMap = fileValuesMap ?? VERSION_DEFAULTS[saveType1 ?? 'all'];
    // if no file was put in, the file shouldn't contain any mappings
    fileValuesMap = fileValuesMap ?? {};

    console.log('propMapRelevant1', propMapRelevant1);
    console.log('propMapRelevant2', propMapRelevant2);
    console.log('fileValuesMap', fileValuesMap);


    // all prop keys to make editors for.
    // This combination is to include any Unknown properties found in the file
    const allPropKeys = [...new Set(
        [Object.keys(fileValuesMap).map(k => k.split(' ',1)[0]), Object.keys(PROP_INFO)].flat()
    )];

    console.log('allPropKeys', allPropKeys);

    // fill in all property editors
    for (let i = 0; i < allPropKeys.length; i++) {
        const propKey = allPropKeys[i];

        // find all full property keys where the primary part of the key exists in them
        const save1AllPropFullKeys = Object.keys(propMapRelevant1).filter(k => (k.split(' ',1)[0] == propKey)); // space is used as key delimiter
        const save2AllPropFullKeys = Object.keys(propMapRelevant2).filter(k => (k.split(' ',1)[0] == propKey)); // space is used as key delimiter
        const saveFileAllPropFullKeys = Object.keys(fileValuesMap).filter(k => (k.split(' ',1)[0] == propKey)); // space is used as key delimiter
        // bool for if they have that property at least once
        const usedInSaveV1 = save1AllPropFullKeys.length > 0;
        const usedInSaveV2 = save2AllPropFullKeys.length > 0;
        const inFile = saveFileAllPropFullKeys.length > 0;

        // using Set to unique all the key lists
        const combinedAllPropFullKeys = [...new Set(
            [save1AllPropFullKeys, save2AllPropFullKeys, saveFileAllPropFullKeys].flat()
        )];
        combinedAllPropFullKeys.sort((a,b) => (a.localeCompare(b, undefined, { numeric: true })));
        
        // console.log('propKey', propKey);
        // console.log('combinedAllPropFullKeys', combinedAllPropFullKeys);
        // console.log('save1AllPropFullKeys', save1AllPropFullKeys);
        // console.log('save2AllPropFullKeys', save2AllPropFullKeys);
        // console.log('saveFileAllPropFullKeys', saveFileAllPropFullKeys);
        // console.log('usedInSaveV1', usedInSaveV1);
        // console.log('usedInSaveV2', usedInSaveV2);
        // console.log('inFile', inFile);

        // if we should only showRelevantOptions, skip keys that aren't in either of the save versions or the file itself
        if (showRelevantOptions && !(usedInSaveV1 || usedInSaveV2 || inFile)) {
            continue;
        }
        
        // generate editors for all the full keys of the properties
        for (let j = 0; j < combinedAllPropFullKeys.length; j++) {
            const fullKey = combinedAllPropFullKeys[j];

            // extract the extra away from the primary key part
            // The EXTRA is the IMPORTANT PART we want from this!
            let _keysplit = fullKey.split(' ');

            const _propKeyPrimary = _keysplit[0], propKeyExtra = _keysplit.slice(1).join(' ');

            // sanity check, it should be matching
            if(_propKeyPrimary != propKey) {
                console.error(`Why was ${fullKey} found in filtered while not being in the allPropKeys property key list?`)
            }

            // generate and add the editor for it
            
            let editorDiv = `<div class="row"><span>Oops! editor for @${fullKey}@ is not showing. This is not supposed to happen.</span></div>`;
            let propInfo;
            if (PROP_INFO.hasOwnProperty(propKey)) {
                propInfo = PROP_INFO[propKey];
            } else {
                // default info for an editor if we don't know this property yet.
                propInfo = {
                    'category': 'unknown',
                    'name': `@${fullKey}@`,
                    // allow for it being anything. Give it a plain old string editor.
                    'type': 'string'
                }
            }
            
            // derive common info of this property such as its category, type, and resolved name.
            const category = propInfo.category;
            const propNameMap = propInfo.name_map;
            let propNameMapResult;
            // resolve name map if needed
            if(typeof(propNameMap) === "string") {
                // it is referring to another known name map, not in the same file. could be version-dynamic.
                switch (propNameMap) {
                    case "_self":
                        propNameMapResult = { 'name': propKeyExtra };
                        break;
                    case "item":
                        propNameMapResult = NAME_MAP_ITEMS[propKeyExtra] ?? { 'name': propKeyExtra };
                        break;
                    case "clothing":
                        propNameMapResult = NAME_MAP_CLOTHING[propKeyExtra] ?? { 'name': propKeyExtra };
                        break;
                    // case "structure":
                    //     propNameMap = NAME_MAP_STRUCTURE[propKeyExtra] ?? { 'name': propKeyExtra };
                    //     break;
                    default:
                        console.error(`Unknown name map "${propNameMap}" referenced! Defaulting to null.`)
                        propNameMapResult = null;
                        break;
                }
            } else if(typeof(propNameMap) === "object") {
                // console.log(propNameMap);
                // console.log(propKeyExtra, propNameMap[propKeyExtra]);
                propNameMapResult = propNameMap[propKeyExtra];
            }
            const propName = propNameMapResult
                                ? propInfo.name?.replace('{name}', (
                                                    typeof(propNameMapResult) === "string" || typeof(propNameMapResult) === "number"
                                                        ? propNameMapResult
                                                        : propNameMapResult.name
                                                    ))
                                : propInfo.name;
            const type = propInfo.type;
            const propNote = propInfo.note;

            // console.log('fullKey', fullKey);
            // console.log('propKeyExtra', propKeyExtra);
            // console.log('propNameMap', propNameMap);

            // find the accordion collapse body to append it into
            const categoryCollapseDiv = $(`#propCollapse-${category}`);
            if (!categoryCollapseDiv ?? categoryCollapseDiv.length <= 0) {
                console.error(`Category "${category}" collapse not found for propKey ${propKey}! Putting in "misc" for now.`);
                category = 'misc';
                const categoryCollapseDiv = $(`#propCollapse-${category}`);
            }

            const fullKeyNoSpaces = fullKey.replaceAll(' ','_');

            if(type == 'float-range' && propInfo.range) {
                // break propInfo.range into min and max
                propInfo.min = propInfo.range[0];
                propInfo.max = propInfo.range[1];
            }

            let propDropdownValues;
            if(type == 'int-dropdown' || type == 'intlist') {
                // get the dropdown's values
                if(typeof(propInfo.dropdown) === "string") {
                    // resolve a possibly version-specific result
                    propDropdownValues = resolveDropdown(propInfo.dropdown, saveType1, saveType2);
                    console.log('propDropdownValues:', propDropdownValues);
                } else if(typeof(propInfo.dropdown) === "object") {
                    propDropdownValues = propInfo.dropdown;
                }
                // add any extra values for this property
                if(typeof(propInfo.dropdown_extra) === "object")
                    propDropdownValues = {...propDropdownValues, ...propInfo.dropdown_extra};
            }

            const doInputRecord = (type == 'int-dropdown' && propInfo.dropdown == 'dropdown-keybinds');
            
            // create the editor
            if(showRawEditors || !showRawEditors) { // TODO: remove the !showRawEditors
                // raw editor; treat all as individuals. Can disregard the key specifics for special editors
                editorDiv = `<div class="row">
                    <div class="col --d-sm-none --d-md-block save-data-descr"
                        prop-used-in-v1="${usedInSaveV1?'true':'false'}" prop-used-in-v2="${usedInSaveV2?'true':'false'}" prop-in-file="${inFile?'true':'false'}"
                        >
                        <span>${propName}</span>
                        ${propNote ? `<a class="form-text" id="propHelp-${fullKeyNoSpaces}" tabindex="0"
                            data-bs-toggle="tooltip" data-bs-placement="top" title="${propNote}"
                            ><i class="bi-question-circle"></i></a>` : ''}
                        <div class="col">
                            ${usedInSaveV1
                                ? `<span class="form-text d-parent-hover-inline">Key name: @${fullKey}@</span>`
                                : ''}
                            ${usedInSaveV2 && fullKey != fullKey // TODO: can change this if/when the game edits the actual save key in a version (may be never)
                                ? `<span class="form-text d-parent-hover-inline">Key name in comparison version: @${fullKey}@</span>`
                                : ''}
                        </div>
                    </div>`;
                // add usage indicators
                editorDiv += `<div id="useIn1-${fullKeyNoSpaces}"
                                class="col --col-1 col-md-auto fs-5 save-data-val ${!usedInSaveV1 ? 'unused' : ''}"
                                prop-unused="${!usedInSaveV1 ? 'true' : 'false'}">
                    ${usedInSaveV1
                        ? '<i class="not-warning bi-check-lg" title="used by selected save version" aria-label="used by selected save version"></i>'
                        : '<i class="not-warning bi-x-lg" title="ignored by selected save version" aria-label="ignored by selected save version"></i>'}
                    <i class="yes-warning d-none bi-exclamation-triangle" title="selected save version may not accept the value"
                    aria-label="selected save version may not accept the value"
                    data-bs-toggle="tooltip" data-bs-placement="top"></i>
                </div>`;
                editorDiv += `<div id="useIn2-${fullKeyNoSpaces}"
                                class="col --col-1 col-md-auto fs-5 save-data-val ${!saveType2 ? 'd-none' : ''} ${!usedInSaveV2 ? 'unused' : ''}"
                                prop-unused="${!usedInSaveV2 ? 'true' : 'false'}">
                    ${usedInSaveV2
                        ? '<i class="not-warning bi-check-lg" title="used by selected comparison version" aria-label="used by selected comparison version"></i>'
                        : '<i class="not-warning bi-x-lg" title="ignored by selected comparison version" aria-label="ignored by selected comparison version"></i>'}
                    <i class="yes-warning d-none bi-exclamation-triangle" title="selected save version may not accept the value"
                    aria-label="selected save version may not accept the value"
                    data-bs-toggle="tooltip" data-bs-placement="top"></i>
                </div>`;

                // add actual value editor
                editorDiv += `<div class="col-12 col-md-6 save-data-val">`;
                editorDiv += `<div class="row input-editors-row">`; // inner row for layout
                let rawInputColClass = 'col-3';
                let rawInputMinWidth = '15ch';
                switch (type) {
                    case 'bool':
                        editorDiv += `<div class="col m-auto">
                                <div class="form-switch">
                                    <input class="form-check-input switch-lg" type="checkbox" id="inputNeat-${fullKeyNoSpaces}"
                                    aria-label="${propName}">
                                </div>
                            </div>`;
                        break;
                    case 'color':
                        editorDiv += `<div class="col">
                                <div class="input-group">
                                    <input class="form-control form-control-color" type="color" id="inputNeat-${fullKeyNoSpaces}"
                                    title="Choose a color" value="">
                                    <input class="form-control hex-color-input" type="text" id="inputHex-${fullKeyNoSpaces}"
                                    title="Edit hex value of color" placeholder="Hex color">
                                </div>
                            </div>`;
                        break;
                    case 'float-range':
                        editorDiv += `<div class="col m-auto">
                                <input class="form-range" type="range" id="inputNeat-${fullKeyNoSpaces}"
                                min="${propInfo.min ?? 0}" max="${propInfo.max ?? 1}" step="${propInfo.step ?? 0.01}">
                            </div>`;
                        break;
                    case 'int':
                        editorDiv += `<div class="col">
                                <input class="form-control" type="number" id="inputNeat-${fullKeyNoSpaces}">
                            </div>`;
                        break;
                    case 'int-dropdown':
                        if (doInputRecord) {
                            rawInputMinWidth = '10ch';
                            rawInputColClass = 'col-2';
                            editorDiv += `<div class="col w-1">
                                <div class="input-group">
                                    <input id="inputRecord-${fullKeyNoSpaces}" record-input-for="inputNeat-${fullKeyNoSpaces}" type="text"
                                    placeholder="Record input" class="form-control record-input"
                                    title="Press any key or mouse click in this box to record its input ID. To exit, click out of this box."
                                    oncontextmenu="return false;">
                                    `;
                        } else {
                            editorDiv += `<div class="col w-25">`;
                        }
                        editorDiv += `<select id="inputNeat-${fullKeyNoSpaces}" placeholder="Type to search value..." autocomplete="off"
                                    class="mw-100">
                        `;
                        // editorDiv += `<option value="" disabled selected>Unset</option>`;
                        // add the options inside the select
                        for (const [optionValue, optionContents] of Object.entries(propDropdownValues)) {
                            editorDiv += `<option value="${optionValue}">${optionContents}</option>`;
                        }
                        editorDiv +=`
                                    </select>
                                ${doInputRecord ? '</div>' : ''}
                            </div>`;
                        break;
                    case 'intlist':
                        rawInputColClass = 'col-7';
                        editorDiv += `<div class="col">
                                <button id="btnIntlistAdd-${fullKeyNoSpaces}" type="button"
                                class="btn btn-secondary" title="Erase parameter value" aria-label="Erase parameter value">
                                <i class="bi-plus-lg"></i>Add</button>
                            </div>`;
                        break;
                    case 'string':
                    default:
                        editorDiv += `<div class="col">
                                <input class="form-control" type="text" id="inputNeat-${fullKeyNoSpaces}">
                            </div>`;
                        break;
                }
                // add eraser
                editorDiv += `<div class="col p-0 col-auto d-flex flex-row justify-content-end">
                        <button id="btnErase-${fullKeyNoSpaces}" type="button"
                        class="btn btn-outline-secondary h-100 py-0 px-2 border-0 invisible"
                        title="Erase parameter value" aria-label="Erase parameter value">
                            <i class="fs-5 bi-eraser-fill"></i>
                        </button>
                    </div>`;
                // add raw value
                editorDiv += `<div class="col ${rawInputColClass}" style="min-width:${rawInputMinWidth}">
                                <input class="form-control raw-input" type="text" id="inputRaw-${fullKeyNoSpaces}" name="${fullKeyNoSpaces}"
                                title="Actual raw value that the save file will hold" placeholder="no value" disabled>
                            </div>`;
                editorDiv += `</div>`; // close inner row
                editorDiv += `</div>`;
            } else {
                console.error('TODO show fancy editor (not raw editor)! ' + fullKey);
            }
            categoryCollapseDiv.append(editorDiv);


            // setup tooltips
            let helpElem = document.getElementById(`propHelp-${fullKeyNoSpaces}`);
            if(helpElem) {
                let tooltip = new bootstrap.Tooltip(helpElem);
                paramsFormTooltipList.push(tooltip);
            }
            // setup tomselect searchable select dropdown
            let selectElem = document.querySelector(`select#inputNeat-${fullKeyNoSpaces}`);
            // console.log('tomselect\'s selectElem:', selectElem);
            if(selectElem) {
                // start the select as empty
                selectElem.value = '';
                // let tomselect = new TomSelect("#select-beast",{
                let tomselect = new TomSelect(selectElem, {
                    create: false,
                    sortField: {
                        field: "text"
                        // direction: "asc"
                    }
                    , maxOptions: null  // default was 50; this will allow ALL <option> s to show
                });
                paramsFormTomSelectList.push(tomselect);
            }
            // setup input recorder
            let inputRecordElem = document.getElementById(`inputRecord-${fullKeyNoSpaces}`);
            if(inputRecordElem) {
                setupInputRecorder(inputRecordElem, (ucode) => updateSaveProp(fullKey, propInfo, ucode, editorUpdateCallback));
            }
            // setup intlist element adder
            let btnAddElem = document.getElementById(`btnIntlistAdd-${fullKeyNoSpaces}`);
            let intlistChangeCallback;
            if(btnAddElem) {
                // let intlistColElem = document.getElementById(`intlistCol-${fullKeyNoSpaces}`);
                // back it out to the entire col which contains the row which contains the col that this is in
                let intlistColElem = btnAddElem.parentElement.parentElement.parentElement;
                intlistColElem.intlist = []; // initialize the list of values (currently empty)
                intlistChangeCallback = (changeEvent) => {
                    // handle the item changing
                    updateSaveProp(fullKey, propInfo, intlistColElem.intlist.filter(v=>v!==''&&typeof(v)!=="undefined").join(' '), editorUpdateCallback);
                }
                btnAddElem.onclick = (e) => {
                    // TODO: add dropdown specified, NAME_MAP[propKeyExtra] ?  and handle updating input with new vals
                    addIntlistElem(intlistColElem, fullKeyNoSpaces,
                        intlistChangeCallback, intlistChangeCallback,
                        undefined, propDropdownValues
                    );
                    // call the updater right after adding, because a new item got added
                    intlistChangeCallback(e);
                }
            }

            let useIn1Indicator = document.querySelector(`#useIn1-${fullKeyNoSpaces}>i.yes-warning`);
            let useIn2Indicator = document.querySelector(`#useIn2-${fullKeyNoSpaces}>i.yes-warning`);
            // console.log(`#useIn1-${fullKeyNoSpaces}`);
            // console.log(useIn1Indicator);
            let useIn1tooltip = new bootstrap.Tooltip(useIn1Indicator);
            let useIn2tooltip = new bootstrap.Tooltip(useIn2Indicator);
            useIn1tooltip.disable();
            useIn2tooltip.disable();
            paramsFormTooltipList.push(useIn1tooltip);
            paramsFormTooltipList.push(useIn2tooltip);

            let eraseBtn = document.getElementById(`btnErase-${fullKeyNoSpaces}`);
            eraseBtn.onclick = (e) => updateSaveProp(fullKey, propInfo, '', editorUpdateCallback);


            let editorUpdateCallback = function(warnMessage, saveDataValue) {
                console.log('editorUpdateCallback');
                let useIn1ColjQ = $(`#useIn1-${fullKeyNoSpaces}`);
                let useIn2ColjQ = $(`#useIn2-${fullKeyNoSpaces}`);
                // get the tooltips made for the warning indicators
                let useIn1tooltip = bootstrap.Tooltip.getInstance(useIn1ColjQ.find('i.yes-warning')[0]);
                let useIn2tooltip = bootstrap.Tooltip.getInstance(useIn2ColjQ.find('i.yes-warning')[0]);
                // console.log(paramsFormTooltipList.find((elem) => elem === useIn1tooltip));
                // console.log(paramsFormTooltipList.find((elem) => elem === useIn2tooltip));
                let eraseBtn = $(`#btnErase-${fullKeyNoSpaces}`);
                
                if(!saveDataValue) eraseBtn.addClass('invisible');
                else eraseBtn.removeClass('invisible');
                
                // handle any warning messages that may have come through
                if(usedInSaveV1 && warnMessage?.v1) {
                    // warning show, and enable warning tooltip.
                    useIn1ColjQ.addClass('warning');
                    // useIn1ColjQ.removeClass('unused');
                    useIn1ColjQ.find('i.not-warning').addClass('d-none');
                    useIn1ColjQ.find('i.yes-warning').removeClass('d-none');
                    useIn1ColjQ.find('i.yes-warning').attr('data-bs-original-title', warnMessage.v1);
                    useIn1ColjQ.find('i.yes-warning').attr('aria-label', warnMessage.v1);
                    useIn1tooltip.enable();
                } else {
                    // back to normal. disable warning tooltip.
                    useIn1ColjQ.removeClass('warning');
                    // if(useIn1ColjQ.attr('prop-unused') == 'true')
                    //     useIn1ColjQ.addClass('unused');
                    useIn1ColjQ.find('i.not-warning').removeClass('d-none');
                    useIn1ColjQ.find('i.yes-warning').addClass('d-none');
                    useIn1tooltip.disable();
                }
                // set the save data's value into both to keep them in sync.
                if(type == 'bool') {
                    // saveDataValue would be 1 or 0
                    // console.log('saveDataValue:',saveDataValue);
                    $(`#inputRaw-${fullKeyNoSpaces}`).val(saveDataValue);
                    document.getElementById(`inputNeat-${fullKeyNoSpaces}`).checked = (saveDataValue === '0' ? false : !!saveDataValue); // truthy
                } else if(type == 'int-dropdown') {
                    $(`#inputRaw-${fullKeyNoSpaces}`).val(saveDataValue);
                    let inputNeatDropdown = document.getElementById(`inputNeat-${fullKeyNoSpaces}`);
                    if(inputNeatDropdown.tomselect)
                        // handle value change through TomSelect instead
                        inputNeatDropdown.tomselect.setValue(saveDataValue, true); // set silent to true
                    else
                        // no TomSelect attached then. Regular dropdown
                        inputNeatDropdown.value = saveDataValue;
                } else if(type == 'intlist') {
                    $(`#inputRaw-${fullKeyNoSpaces}`).val(saveDataValue);
                    const intlistToSet = Array.isArray(saveDataValue) ? saveDataValue
                                        : saveDataValue ? saveDataValue.split(' ').filter(v=>v!==''&&typeof(v)!=="undefined")
                                        : [];
                    console.log('intlistToSet:', intlistToSet);
                    const intlistColElem = document.getElementById(`btnIntlistAdd-${fullKeyNoSpaces}`).closest('.save-data-val');
                    let i;
                    for (i = intlistColElem.children.length - 1; i >= 0; i--) {
                        const rowElem = intlistColElem.children[i];
                        if(!rowElem.classList.contains('intlist-item-row')) {
                            // not an editor
                            continue;
                        }
                        console.log('i:',i,'rowElem:',rowElem);
                        let editor, tomselect;
                        editor = rowElem.querySelector('input');
                        tomselect = rowElem.querySelector('select')?.tomselect;
                        if(i >= intlistToSet.length) {
                            // remove extra editor
                            if(tomselect) {
                                tomselect.destroy();
                                let i = paramsFormTomSelectList.indexOf(tomselect);
                                if(i > -1)
                                    paramsFormTomSelectList.splice(i, 1);
                            }
                            // remove the extra int from the column's intlist
                            intlistColElem.intlist.splice(
                                rowElem.listindex,
                                1);
                            console.log('intlistColElem.intlist after splice:', intlistColElem.intlist);
                            rowElem.remove();
                        } else {
                            // edit editor
                            if(tomselect) {
                                tomselect.setValue(intlistToSet[i], true); // set silent to true
                            } else {
                                editor.value = intlistToSet[i];
                            }
                            intlistColElem.intlist[i] = intlistToSet[i];
                        }
                    }
                    // console.log('i after going through rowElems:', i);
                    // make more if needed
                    i = intlistColElem.children.length;
                    while (i < intlistToSet.length) {
                        addIntlistElem(intlistColElem, fullKeyNoSpaces,
                            intlistChangeCallback, intlistChangeCallback,
                            undefined, propDropdownValues);
                        i++;
                    }
                } else if(type == 'color') {
                    let hexmatch = saveDataValue?.match(HEX_COL_PATTERN), savematch = saveDataValue?.match(SAVE_COL_PATTERN);
                    $(`#inputRaw-${fullKeyNoSpaces}`).val(hexmatch ? hexToSave(saveDataValue) : saveDataValue);
                    $(`#inputNeat-${fullKeyNoSpaces}`).val(savematch ? saveToHex(saveDataValue) : saveDataValue);
                    $(`#inputHex-${fullKeyNoSpaces}`).val(savematch ? saveToHex(saveDataValue) : hexmatch ? saveDataValue : '');
                } else {
                    $(`#inputRaw-${fullKeyNoSpaces}`).val(saveDataValue);
                    $(`#inputNeat-${fullKeyNoSpaces}`).val(saveDataValue);
                }
            } // end editorUpdateCallback

            // apply listeners
            let rawEditor = $(`#inputRaw-${fullKeyNoSpaces}`);
            let neatEditor = $(`#inputNeat-${fullKeyNoSpaces}`);
            if(type == 'float-range') {
                rawEditor.change(e => updateSaveProp(fullKey, propInfo, rawEditor.val(), editorUpdateCallback));
                neatEditor.on('input', e => updateSaveProp(fullKey, propInfo, neatEditor.val(), editorUpdateCallback));
            } else if(type == 'bool') {
                // checkboxes handle value differently
                rawEditor.change(e => updateSaveProp(fullKey, propInfo, rawEditor.val(), editorUpdateCallback));
                neatEditor.change(e => updateSaveProp(fullKey, propInfo, neatEditor[0].checked, editorUpdateCallback));
            } else if(type == 'color') {
                let textHexEditor = document.getElementById(`inputHex-${fullKeyNoSpaces}`);
                rawEditor.change(e => updateSaveProp(fullKey, propInfo, rawEditor.val(), editorUpdateCallback));
                neatEditor.change(e => updateSaveProp(fullKey, propInfo, neatEditor.val(), editorUpdateCallback));
                textHexEditor.addEventListener('change', e => updateSaveProp(fullKey, propInfo, textHexEditor.value, editorUpdateCallback));
            } else {
                rawEditor.change(e => updateSaveProp(fullKey, propInfo, rawEditor.val(), editorUpdateCallback));
                // neatEditor.on('input', e => updateSaveProp(fullKey, propInfo, neatEditor.val(), editorUpdateCallback));
                neatEditor.change(e => updateSaveProp(fullKey, propInfo, neatEditor.val(), editorUpdateCallback));
            }
            
            // give an initial value, if applicable.
            // console.log('fullkey:', fullKey, 'currentSaveData.hasOwnProperty(fullKey)', currentSaveData.hasOwnProperty(fullKey), 'currentSaveData[fullKey]', currentSaveData[fullKey]);
            // console.log('fullkey:', fullKey, 'currentSaveData.has(fullKey)', currentSaveData.has(fullKey), 'currentSaveData.get(fullKey)', currentSaveData.get(fullKey));
            // console.log('currentSaveData:', currentSaveData.toString());
            // console.log('typeof(currentSaveData):', (typeof(currentSaveData)).toString());
            if (currentSaveData?.has(fullKey)) {
                updateSaveProp(fullKey, propInfo, currentSaveData.get(fullKey), editorUpdateCallback);
            }
        } // end for all full property keys

    } // end for all property keys

    console.log(`currentSaveData after inserting all property keys:`, currentSaveData, 'size:', currentSaveData.size);

    // updateGameVersionInfoOnPage(null, $('#saveType1').val());
};

function updateSaveProp(fullKey, propInfo, editorNewValue, editorUpdateCallback) {
    console.log('updateSaveProp');
    let warnMessage = {};
    if(!propInfo.required && editorNewValue === "" && propInfo.type != 'intlist') {
        // only intlist should keep a value of "" for example.
        currentSaveData.delete(fullKey);
    } else {
        // validate
        switch(propInfo.type) {
            case 'bool':
                if(editorNewValue === true) editorNewValue = '1';
                else if(editorNewValue === false) editorNewValue = '0';
                if(editorNewValue !== '1' && editorNewValue !== '0') {
                    warnMessage['v1'] = 'Expects the value to be 1 or 0 (true or false)!'
                    warnMessage['v2'] = 'Expects the value to be 1 or 0 (true or false)!'
                }
                break;
            case 'color':
                if(!editorNewValue.match(SAVE_COL_PATTERN) && !editorNewValue.match(HEX_COL_PATTERN)) {
                    warnMessage['v1'] = 'Expects the value to be a valid color! (R;G;B;A and each value is 0-1)'
                    warnMessage['v2'] = 'Expects the value to be a valid color! (R;G;B;A and each value is 0-1)'
                }
                break;
            case 'float-range':
                if(propInfo.min && Number(editorNewValue) < propInfo.min) {
                    warnMessage['v1'] = `Expects the value to be > ${propInfo.min}!`
                    warnMessage['v2'] = `Expects the value to be > ${propInfo.min}!`
                }
                if(propInfo.max && Number(editorNewValue) > propInfo.max) {
                    warnMessage['v1'] = `Expects the value to be < ${propInfo.max}!`
                    warnMessage['v2'] = `Expects the value to be < ${propInfo.max}!`
                }
                break;
            case 'int':
                if(!isInt(editorNewValue)) {
                    warnMessage['v1'] = 'Expects the value to be a number!'
                    warnMessage['v2'] = 'Expects the value to be a number!'
                }
                break;
            // case 'int-dropdown':
            //     break;
            // case 'intlist':
            //     break;
            case 'string':
            default:
                break;
        }
        currentSaveData.set(fullKey, editorNewValue);
    }
    editorUpdateCallback(warnMessage, currentSaveData.get(fullKey));
};

function setupInputRecorder(elem, unityCodeCallback) {
    elem.addEventListener("keydown", (e) => {
        // Handling key presses (keydown).
        let unityCode = keyToUnity(e);
        if(unityCode !== null) {
            unityCodeCallback(unityCode);
        } else {
            console.error(`Oops. No keycode mapping was found for recorded input (key="${e.key}" code="${e.code}").`);
            alert(`Oops. No keycode mapping was found for recorded input (key="${e.key}" code="${e.code}").`);
        }
        e.preventDefault();
        return false;
    });
    elem.addEventListener("mouseup", (e) => {
        // Handling mouse buttons (mouseup).
        // Note: browser forward and back may not be captured (and/or prevented) in all browsers.
        let unityCode = mouseToUnity(e);
        if(unityCode !== null) {
            unityCodeCallback(unityCode);
        } else {
            console.error(`Oops. No keycode mapping was found for recorded input (mouse button=${e.button}).`);
            alert(`Oops. No keycode mapping was found for recorded input (mouse button=${e.button}).`);
        }
        // TODO delayed clear from linux?
        // Note that linux could paste with middle mouse.

        e.preventDefault();
        return;
    });
}

function doFileFormData(event) {
    // Event.stop(event);
    event?.preventDefault();
    getFileFormData();
    // console.log(event);
    return true;
}
function getFileFormData() {
    var formData = new FormData(document.forms.fileForm);
    console.log(document.forms.fileForm);
    console.log(formData);
    // console.log('showRelevantOptions', formData.get('showRelevantOptions'));
    // console.log('fileSelect', formData.get('fileSelect'));
    // console.log('saveType1', formData.get('saveType1'));
    // console.log('saveType2', formData.get('saveType2'));
    // console.log('!showRelevantOptions', !formData.get('showRelevantOptions'));
    // console.log('!saveType2', !formData.get('saveType2'));
    // for (const pair of formData.entries()) {
    //     console.log(`formData entry: ${pair[0]}, ${pair[1]}`);
    // }
    // console.log('entries:', Array.from(formData.entries()));
    // Object.fromEntries(formData);
    let showRelevantOptions = !!formData.get('showRelevantOptions');
    let showRawEditors = !!formData.get('showRawEditors');
    let saveType1 = formData.get('saveType1');
    let saveType2 = formData.get('saveType2');
    // let showSaveType2 = !!saveType2;

    // get save file original params (not currentSaveData, which may have some changes)
    let fileValuesMap = readFile(formData.get('fileSelect'), saveType1);
    // fill out the save file params form
    fillParamsForm(saveType1, saveType2, showRelevantOptions, showRawEditors, /*PROP_INFO,*/ fileValuesMap);
}

// function parseFileTest(event) {
//     console.log('file input event:', event);
//     console.log('event.target.files:', event.target.files);
// }

// $('#fileSelect').change(parseFileTest);
// $('#fileSelect').change((e) => {
//     currentSaveData = readFile(document.getElementById('fileSelect').files[0], $('#saveType1').val());
//     console.log('fileSelect change');
//     // console.log(document.getElementById('fileSelect').files[0]);
//     // console.log(currentSaveData);
//     // return;
//     getFileFormData();
// });



// $(document).ready(function() {
//     let newFileValuesMap = readFile(document.getElementById('fileSelect').files[0], $('#saveType1').val());
//     console.log('document.ready newFileValuesMap (opposed to #fileForm.change currently):', newFileValuesMap);
// });


function getCategoryCollapseElem(categoryName) {
    const collapseDiv = document.getElementById(`propCollapse-${categoryName}`);
    // if(!categoryCollapseDiv) {
    //     console.error(`Category "${category}" collapse not found! Putting in "misc".`);
    // }
    // return document.getElementById(`propCollapse-misc`);
    return collapseDiv;
}

function resolvePropInfoName(propInfo, propKeyExtra) {
    const propNameMap = propInfo.name_map;
    let propNameMapResult;
    // resolve name map if needed
    if(typeof(propNameMap) === "string") {
        // it is referring to another known name map, not in the same file. could be version-dynamic.
        switch (propNameMap) {
            case "_self":
                propNameMapResult = { 'name': propKeyExtra };
                break;
            case "item":
                propNameMapResult = NAME_MAP_ITEMS[propKeyExtra] ?? { 'name': propKeyExtra };
                break;
            case "clothing":
                propNameMapResult = NAME_MAP_CLOTHING[propKeyExtra] ?? { 'name': propKeyExtra };
                break;
            // case "structure":
            //     propNameMap = NAME_MAP_STRUCTURE[propKeyExtra] ?? { 'name': propKeyExtra };
            //     break;
            default:
                console.error(`Unknown name map "${propNameMap}" referenced! Defaulting to null.`)
                propNameMapResult = null;
                break;
        }
    } else if(typeof(propNameMap) === "object") {
        // console.log(propNameMap);
        // console.log(propKeyExtra, propNameMap[propKeyExtra]);
        propNameMapResult = propNameMap[propKeyExtra];
    }
    const propName = propNameMapResult
                        ? propInfo.name?.replace('{name}', (
                                            typeof(propNameMapResult) === "string" || typeof(propNameMapResult) === "number"
                                                ? propNameMapResult
                                                : propNameMapResult.name
                                            ))
                        : propInfo.name;
    return propName;
}

function splitFullKey(fullKey) {
    let _keysplit = fullKey.split(' ');
    const propKeyBase = _keysplit[0], propKeyExtra = _keysplit.slice(1).join(' ');
    return [propKeyBase, propKeyExtra];
}

function getPropInfo(fullKey) {
    // extract the extra away from the primary key part
    const [propKeyBase, propKeyExtra] = splitFullKey(fullKey);

    let propInfo;
    if (PROP_INFO.hasOwnProperty(propKeyBase)) {
        propInfo = PROP_INFO[propKeyBase];
    } else {
        // default info for an editor if we don't know this property yet.
        propInfo = {
            'category': 'unknown',
            // display the property key as the name to make it obvious.
            'name': `@${fullKey}@`,
            // allow for it being anything. Give it a plain old string editor.
            'type': 'string'
        }
    }
    return propInfo;
}

function selectorSafeFullKey(fullKey) {
    // return fullKey.replaceAll(' ','_');
    return fullKey.replaceAll(/[^a-zA-Z0-9\-_]/g,'_');
}

function resolveDropdownFromPropInfo(propInfo, saveType1, saveType2) {
    const type = propInfo.type;
    let propDropdownValues;
    if(type == 'int-dropdown' || type == 'intlist') {
        // get the dropdown's values
        if(typeof(propInfo.dropdown) === "string") {
            // resolve a possibly version-specific result
            propDropdownValues = resolveDropdown(propInfo.dropdown, saveType1, saveType2);
            console.log('propDropdownValues:', propDropdownValues);
        } else if(typeof(propInfo.dropdown) === "object") {
            propDropdownValues = propInfo.dropdown;
        }
        // add any extra values for this property
        if(typeof(propInfo.dropdown_extra) === "object")
            propDropdownValues = {...propDropdownValues, ...propInfo.dropdown_extra};
    }
    return propDropdownValues;
}

/*
<div class="row">
    <div class="col --d-sm-none --d-md-block save-data-descr" prop-used-in-v1="true" prop-used-in-v2="false" prop-in-file="false">
        <span>Retrieved Timmy the Penguin Chick</span>
            
        <div class="col">
            <span class="form-text d-parent-hover-inline">Key name: @objectRetrieved Timmy the Penguin Chick@</span>
            
        </div>
    </div>
    <div id="useIn1-objectRetrieved_Timmy_the_Penguin_Chick" class="col --col-1 col-md-auto fs-5 save-data-val" prop-unused="false">
        <i class="not-warning bi-check-lg" title="used by selected save version" aria-label="used by selected save version"></i>
        <i class="yes-warning d-none bi-exclamation-triangle" aria-label="selected save version may not accept the value" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="selected save version may not accept the value"></i>
    </div>
    <div id="useIn2-objectRetrieved_Timmy_the_Penguin_Chick" class="col --col-1 col-md-auto fs-5 save-data-val d-none unused" prop-unused="true">
        <i class="not-warning bi-x-lg" title="ignored by selected comparison version" aria-label="ignored by selected comparison version"></i>
        <i class="yes-warning d-none bi-exclamation-triangle" aria-label="selected save version may not accept the value" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="selected save version may not accept the value"></i>
    </div>
    <div class="col-12 col-md-6 save-data-val">
        <div class="row input-editors-row">
            <div class="col m-auto">
                <div class="form-switch">
                    <input class="form-check-input switch-lg" type="checkbox" id="inputNeat-objectRetrieved_Timmy_the_Penguin_Chick" aria-label="Retrieved Timmy the Penguin Chick">
                </div>
            </div>
            <div class="col p-0 col-auto d-flex flex-row justify-content-end">
                    <button id="btnErase-objectRetrieved_Timmy_the_Penguin_Chick" type="button" class="btn btn-outline-secondary h-100 py-0 px-2 border-0" title="Erase parameter value" aria-label="Erase parameter value">
                    <i class="fs-5 bi-eraser-fill"></i>
                </button>
            </div>
            <div class="col col-3" style="min-width:15ch">
                <input class="form-control raw-input" type="text" id="inputRaw-objectRetrieved_Timmy_the_Penguin_Chick" name="objectRetrieved_Timmy_the_Penguin_Chick" title="Actual raw value that the save file will hold" placeholder="no value" disabled="">
            </div>
        </div>
    </div>
</div>
*/

function toggleUseIndicators(fullKeyNoSpaces, saveType1, saveType2, usedInSaveV1, usedInSaveV2) {
    /* version usage indicators
     * div contains the icons and should be as follows:
     *   div is: `#useIn1-${fullKeyNoSpaces}` or `#useIn2-${fullKeyNoSpaces}`
     *      if useIn1 and !usedInSaveV1, should have class .unused
     *      if useIn2 and !saveType2,    should have class .d-none
     *      if useIn2 and !usedInSaveV2, should have class .unused
     *   icons are children:
     *      if problem,   .yes-warning           (.bi-exclamation-triangle)
     *      if used,      .not-warning.yes-used  (.bi-check-lg)
     *      if not used,  .not-warning.not-used  (.bi-x-lg)
     * */
    let usageIndDiv1 = document.getElementById(`useIn1-${fullKeyNoSpaces}`);
    let usageIndDiv2 = document.getElementById(`useIn2-${fullKeyNoSpaces}`);

    if(usedInSaveV1) {
        usageIndDiv1.classList.remove('unused');
    } else {
        usageIndDiv1.classList.add('unused');
    }
    if(usedInSaveV2) {
        usageIndDiv2.classList.remove('unused');
    } else {
        usageIndDiv2.classList.add('unused');
    }
    if(saveType2) {
        usageIndDiv2.classList.remove('d-none');
    } else {
        usageIndDiv2.classList.add('d-none');
    }
}

function updateWarningIndicator(fullKeyNoSpaces, showWarning, isSaveType1, hideEntireIndicator, warning, isUsedInSaveVersion) {
    let usageIndDiv = $(`#useIn${!isSaveType1 || isSaveType1===2 ? '2' : '1'}-${fullKeyNoSpaces}`);
    let usageIndTooltip = bootstrap.Tooltip.getInstance(usageIndDiv.find('i.yes-warning')[0]);
    if(!usageIndDiv) {
        console.error(`showWarningIndicator: No usage div for "${fullKeyNoSpaces}", isSaveType1=${isSaveType1}`);
        return;
    }
    if(hideEntireIndicator) {
        usageIndDiv.addClass('d-none');
        showWarning = false;  // artificially display no warning
    } else {
        usageIndDiv.removeClass('d-none');
    }
    if(showWarning) {
        // show the warning indicator,  hide both normal yes and no
        usageIndDiv.addClass('warning');
        usageIndDiv.find('i.not-warning').addClass('d-none');
        usageIndDiv.find('i.yes-warning').removeClass('d-none');
        usageIndDiv.find('i.yes-warning').attr('data-bs-original-title', warning);
        usageIndDiv.find('i.yes-warning').attr('aria-label', warning);
        usageIndTooltip.enable();
    } else {
        // hide the warning indicator,  show _either_ the normal yes or no
        usageIndDiv.removeClass('warning');
        let attrIsUsed = usageIndDiv.attr('is-used');
        if(attrIsUsed === undefined) {
            console.error(`updateWarningIndicator: usage div for ${fullKeyNoSpaces} is missing expected "is-used" attribute`)
        }
        let isUsed = !(attrIsUsed === 'false' || !attrIsUsed);
        if(isUsedInSaveVersion !== undefined && isUsed != isUsedInSaveVersion) {
            // sync the attribute
            usageIndDiv.attr('is-used', isUsedInSaveVersion);
            isUsed = isUsedInSaveVersion;
        }
        // console.log('updateWarningIndicator: isUsed:', isUsed, `fullKeyNoSpaces=${fullKeyNoSpaces} isSaveType1=${isSaveType1}`);
        if(isUsed) {
            usageIndDiv.removeClass('unused');
            usageIndDiv.find('i.not-warning.not-used').addClass('d-none');
            usageIndDiv.find('i.not-warning.yes-used').removeClass('d-none');
        } else {
            usageIndDiv.addClass('unused');
            usageIndDiv.find('i.not-warning.not-used').removeClass('d-none');
            usageIndDiv.find('i.not-warning.yes-used').addClass('d-none');
        }
        usageIndDiv.find('i.yes-warning').addClass('d-none');
        usageIndTooltip.disable();
    }
}

console.error('TODO: toggle icons based on value verification results');


function getValidationInfo(fullKey, propInfo, newValue, saveType1, saveType2) {
    // if(newValue === undefined) {
        //     console.error(`getValidationInfo: undefined value for "${fullKey}"`);
        //     return;
        // }
    let validationResult = {};
    if(!propInfo.required && (newValue === '' || typeof(newValue) === "undefined" || newValue === null)) {
        // unless required, pass values that are empty or undefined
        return validationResult;
    }
    // let saveType1 = $('#saveType1').val(), saveType2 = $('#saveType2').val();
    switch(propInfo.type) {
        case 'bool':
            // convert non-string true/false-like values to strings '0' or '1'
            if(newValue === true) newValue = '1';
            else if(newValue === false) newValue = '0';
            else if(isInt(newValue)) newValue = newValue.toString();
            // only allow true/false-like values, here converted to '0' or '1'.
            if(newValue !== '1' && newValue !== '0') {
                validationResult['warningV1'] = 'Expects the value to be 1 or 0 (true or false)!'
                validationResult['warningV2'] = 'Expects the value to be 1 or 0 (true or false)!'
            }
            break;
        case 'color':
            if(!newValue?.match(SAVE_COL_PATTERN) && !newValue?.match(HEX_COL_PATTERN)) {
                validationResult['warningV1'] = 'Expects the value to be a valid color! (R;G;B;A and each value is 0-1)'
                validationResult['warningV2'] = 'Expects the value to be a valid color! (R;G;B;A and each value is 0-1)'
            }
            break;
        case 'float-range':
            if(propInfo.min && Number(newValue) < propInfo.min) {
                validationResult['warningV1'] = `Expects the value to be > ${propInfo.min}!`
                validationResult['warningV2'] = `Expects the value to be > ${propInfo.min}!`
            }
            if(propInfo.max && Number(newValue) > propInfo.max) {
                validationResult['warningV1'] = `Expects the value to be < ${propInfo.max}!`
                validationResult['warningV2'] = `Expects the value to be < ${propInfo.max}!`
            }
            break;
        case 'int':
            if(!isInt(newValue)) {
                validationResult['warningV1'] = 'Expects the value to be a number!'
                validationResult['warningV2'] = 'Expects the value to be a number!'
            }
            break;
        // case 'int-dropdown':
        //     break;
        case 'intlist':
            // allow empty list '', and consider undefined as an empty list also
            if((newValue!=='' && typeof(newValue)!=="undefined")) {
                if (newValue.split(' ').some(v=>!isInt(v))) {
                    validationResult['warningV1'] = 'Expects whole numbers in every position in the list (space-separated)!'
                    validationResult['warningV2'] = 'Expects whole numbers in every position in the list (space-separated)!'
                } else {
                    // check if loadout size is valid
                    if(fullKey == 'previousLoadout') {
                        let lsizeV1 = getMaxLoadoutSize(saveType1), lsizeV2 = getMaxLoadoutSize(saveType2);
                        if(lsizeV1 && newValue.split(' ').length > lsizeV1) {
                            validationResult['warningV1'] = `Loadout list cannot hold more than ${lsizeV1} items, in selected version!`
                        }
                        if(lsizeV2 && newValue.split(' ').length > lsizeV2) {
                            validationResult['warningV2'] = `Loadout list cannot hold more than ${lsizeV2} items, in selected comparison version!`
                        }
                    }
                }
            }
            break;
        case 'string':
        default:
            break;
    }
    return validationResult;
}

// function refreshIntlistElems(fullKeyNoSpaces, /) {
//     //
// }

function addIntlistElem2(intlistColElem, fullKeyNoSpaces, initVal, dropdownValues) {
    const lindex = intlistColElem.children.length-1;
    // add new value to column's intlist property,  before creating new element editor inside the column
    // initVal = (initVal===null || typeof(initVal)==="undefined")
    //             ? '' : initVal;
    if(typeof(initVal)==="undefined" || initVal===null || initVal==='') {
        console.error('initVal needs to be a value!')
    }
    intlistColElem.intlist.push(initVal.toString());

    // create containing row div
    // Note: the list index for this item is stored as a property of this .intlist-item-row element.
    const newItemRowElem = Object.assign(
        document.createElement('div'),
        // { className: 'row mb-2 intlist-item-row' });
        { className: 'row mb-2 intlist-item-row', listindex: lindex });
    // create children elements
    if(typeof(dropdownValues)==="undefined") {
        // no dropdowns, make just regular number inputs
        const _itemInput = Object.assign(
            document.createElement('input'),
            { className: 'form-control', type: 'number',
            // listindex: lindex, value: initVal }
            value: initVal }
        );
        _itemInput.addEventListener('change', (e) => {
            console.log('before updating intlist:', intlistColElem.intlist);
            // intlistColElem.intlist[e.target.listindex] = e.target.value;
            intlistColElem.intlist[e.target.closest('.intlist-item-row').listindex] = e.target.value;
            console.log('after updating intlist:', intlistColElem.intlist);
            // intlistChangeCallback(e);
            updateEditorRow(fullKeyNoSpaces, intlistColElem.intlist.filter(v=>v!==''&&typeof(v)!=="undefined").join(' '));
        });
        const _itemInputCol = Object.assign(
            document.createElement('div'), { className: 'col' }
        );
        _itemInputCol.append(_itemInput);
        newItemRowElem.append(_itemInputCol);
    } else {
        // make int dropdowns
        const _itemSelect = Object.assign(
            document.createElement('select'),
            { className: 'mw-100', placeholder: 'Type to search value...',
            autocomplete: 'off', value: initVal }
        );
        // add <option> s
        for (const [optionValue, optionContents] of Object.entries(dropdownValues)) {
            const _optionElem = Object.assign(
                document.createElement('option'),
                { value: optionValue, innerHTML: optionContents }
            );
            if(optionValue == initVal) {
                _optionElem.selected = true;
            }
            _itemSelect.append(_optionElem);
        }
        const _itemInputCol = Object.assign(
            document.createElement('div'), { className: 'col' }
        );
        _itemInputCol.append(_itemSelect);
        newItemRowElem.append(_itemInputCol);

        // setup TomSelect for searching options
        let tomselect = new TomSelect(_itemSelect, {
            create: false,
            sortField: {
                field: "text"
                // direction: "asc"
            }
            , maxOptions: null  // default was 50; this will allow ALL <option> s to show
        });
        paramsFormTomSelectList.push(tomselect);
        tomselect.setValue(initVal, true);  // just in case no <option> s were selected
        _itemSelect.addEventListener('change', (e) => {
            console.log('before updating intlist:', intlistColElem.intlist);
            // intlistColElem.intlist[e.target.listindex] = e.target.value;
            intlistColElem.intlist[e.target.closest('.intlist-item-row').listindex] = e.target.value;
            console.log('after updating intlist:', intlistColElem.intlist);
            // intlistChangeCallback(e);
            updateEditorRow(fullKeyNoSpaces, intlistColElem.intlist.filter(v=>v!==''&&typeof(v)!=="undefined").join(' '));
        });
    }
    const _delBtn = Object.assign(
        document.createElement('button'),
        { className: "btn btn-outline-secondary h-100 py-0 px-2 border-0",
        type: 'button', title: "Erase item from list parameter",
        listindex: lindex }
    )
    _delBtn.setAttribute('aria-label', "Erase item from list parameter");
    _delBtn.append(Object.assign(
        document.createElement('i'), { className: 'fs-5 bi-trash-fill' }
    ));
    const _delBtnCol = Object.assign(
        document.createElement('div'), { className: 'col col-auto' }
    );
    _delBtnCol.append(_delBtn);
    newItemRowElem.append(_delBtnCol);

    // add row into column
    intlistColElem.insertBefore(newItemRowElem, intlistColElem.lastChild);
    // handle removal of this item's editor
    _delBtn.onclick = (e) => {
        let enclosingIntlistItemRow = e.target.closest('.intlist-item-row');
        let enclosingIntlistColElem = e.target.closest('.editor-surrounding-col');
        enclosingIntlistColElem.intlist.splice(
            // get input of the same row
            // enclosingIntlistItemRow.querySelector('input').listindex,
            enclosingIntlistItemRow.listindex,
            1);
        // decrement listindex of all other inputs following this one, to fit with the splice above.
        let _rowelem = enclosingIntlistItemRow.nextSibling;
        while(_rowelem.classList.contains('intlist-item-row')) {
            // get input of the row
            // _rowelem.querySelector('input').listindex--;
            _rowelem.listindex--;
            // move to the next row
            _rowelem = _rowelem.nextSibling;
        }
        // now remove this element
        // remove TomSelect if it exists
        let tomselect = enclosingIntlistItemRow.querySelector('select').tomselect;
        if(tomselect) {
            tomselect.destroy();
            let i = paramsFormTomSelectList.indexOf(tomselect);
            if(i > -1)
                paramsFormTomSelectList.splice(i, 1);
        }
        // fully remove the element from the DOM
        enclosingIntlistItemRow.remove();
        // let the callback know it was removed, to handle other stuff (such as updating the value in currentSaveData)
        // intlistDeleteCallback(e);
        updateEditorRow(fullKeyNoSpaces, enclosingIntlistColElem.intlist.filter(v=>v!==''&&typeof(v)!=="undefined").join(' '));
    }

    // fire change listener to apply any initVal it may have immediately to the intlist (as if it was manually selected)
    if(typeof(dropdownValues)==="undefined") {
        newItemRowElem.querySelector('input').dispatchEvent(new Event('change', { bubbles: true }))
    } else {
        newItemRowElem.querySelector('select').dispatchEvent(new Event('change', { bubbles: true }))
    }
}


function addEditorRow(fullKeyNoSpaces, fullKey,
                        propInfo,
                        // propName, propNote,
                        // propDropdownValues,
                        saveType1, saveType2, usedInSaveV1, usedInSaveV2, inSaveFile) {
    const [propKeyBase, propKeyExtra] = splitFullKey(fullKey);
    const category = propInfo.category;
    const propName = resolvePropInfoName(propInfo, propKeyExtra);
    const type = propInfo.type;
    const propNote = propInfo.note;

    let propDropdownValues;
    // if(type == 'int-dropdown' || type == 'intlist') {
    //     // get the dropdown's values
    //     if(typeof(propInfo.dropdown) === "string") {
    //         // resolve a possibly version-specific result
    //         propDropdownValues = resolveDropdown(propInfo.dropdown, saveType1, saveType2);
    //         console.log('propDropdownValues:', propDropdownValues);
    //     } else if(typeof(propInfo.dropdown) === "object") {
    //         propDropdownValues = propInfo.dropdown;
    //     }
    //     // add any extra values for this property
    //     if(typeof(propInfo.dropdown_extra) === "object")
    //         propDropdownValues = {...propDropdownValues, ...propInfo.dropdown_extra};
    // }
    propDropdownValues = resolveDropdownFromPropInfo(propInfo, saveType1, saveType2);

    const doInputRecord = (type == 'int-dropdown' && propInfo.dropdown == 'dropdown-keybinds');

    // get the collapse element the row should be appended into
    let propCollapseElem = getCategoryCollapseElem(category);
    if(propCollapseElem === null) {
        console.error(`addEditorRow: no collapse for fullKey "${fullKey}" category "${category}"`);
        return null;
    }
    if(fullKeyNoSpaces.includes(' ')) {
        console.error(`addEditorRow: fullKeyNoSpaces contained space! fullKeyNoSpaces: "${fullKeyNoSpaces}"`);
        return null;
    }
    if(tryGetEditorRow(fullKeyNoSpaces) !== null) {
        console.error(`addEditorRow: row already exists! found: ${tryGetEditorRow(fullKeyNoSpaces)}`);
        return null;
    }

    //----------------------------------------
    // create surrounding row

    let row = $(`<div id="editorRow-${fullKeyNoSpaces}" class="row editor-row" full-key="${fullKey}">`);

    // add property name part
    row.append(
        $(`<div class="col save-data-descr">
            <span>${propName}</span>
            ${propNote
                ? `<a class="form-text" id="propHelp-${fullKeyNoSpaces}" tabindex="0"
                    data-bs-toggle="tooltip" data-bs-placement="top" title="${propNote}"
                    ><i class="bi-question-circle"></i></a>`
                : ''}
            <div class="col">`+/*col to place key span below the name span*/`
                ${usedInSaveV1 || inSaveFile
                    ? `<span class="form-text d-parent-hover-inline">Key name: @${fullKey}@</span>`
                    : ''}
                ${usedInSaveV2 && fullKey != fullKey // Note: can change this if/when the game edits the actual save key in a version (may be never)
                    ? `<span class="form-text d-parent-hover-inline">Key name in comparison version: @${fullKey}@</span>`
                    : ''}
            </div>
        </div>`)
    );

    /* add version usage indicators
     * div contains the icons and should be as follows:
     *   div is: `#useIn1-${fullKeyNoSpaces}` or `#useIn2-${fullKeyNoSpaces}`
     *      if useIn1 and !usedInSaveV1, should have class .unused    and attr is-used="false"
     *      if useIn2 and !saveType2,    should have class .d-none
     *      if useIn2 and !usedInSaveV2, should have class .unused    and attr is-used="false"
     *   icons are children:
     *      if problem,   .yes-warning           (.bi-exclamation-triangle)
     *      if used,      .not-warning.yes-used  (.bi-check-lg)
     *      if not used,  .not-warning.not-used  (.bi-x-lg)
     * */
    row.append(
        $(`<div id="useIn1-${fullKeyNoSpaces}" class="col --col-1 col-md-auto fs-5 save-data-val" is-used="true">
            <i class="not-warning yes-used bi-check-lg"
                title="used by selected save version" aria-label="used by selected save version"></i>
            <i class="not-warning not-used bi-x-lg"
                title="ignored by selected save version" aria-label="ignored by selected save version"></i>
            <i class="yes-warning d-none bi-exclamation-triangle" aria-label="selected save version may not accept the value"
                data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="selected save version may not accept the value"></i>
        </div>
        <div id="useIn2-${fullKeyNoSpaces}" class="col --col-1 col-md-auto fs-5 save-data-val d-none unused" is-used="false">
            <i class="not-warning yes-used bi-check-lg"
                title="used by selected comparison version" aria-label="used by selected comparison version"></i>
            <i class="not-warning not-used bi-x-lg"
                title="ignored by selected comparison version" aria-label="ignored by selected comparison version"></i>
            <i class="yes-warning d-none bi-exclamation-triangle" aria-label="selected comparison save version may not accept the value"
                data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="selected comparison save version may not accept the value"></i>
        </div>`)
    );

    // add property editor
    let editorSurroundingElem = $(`<div class="col-12 col-md-6 save-data-val editor-surrounding-col"></div>`);
    let editorDivText = `<div class="row input-editors-row">`; // inner row for layout
    let rawInputColClass = 'col-3', rawInputMinWidth = '15ch';
    switch (type) {
        case 'bool':
            editorDivText += `<div class="col m-auto">
                    <div class="form-switch">
                        <input class="form-check-input switch-lg" type="checkbox" id="inputNeat-${fullKeyNoSpaces}"
                        aria-label="${propName}">
                    </div>
                </div>`;
            break;
        case 'color':
            editorDivText += `<div class="col">
                    <div class="input-group">
                        <input class="form-control form-control-color" type="color" id="inputNeat-${fullKeyNoSpaces}"
                        title="Choose a color" value="">
                        <input class="form-control hex-color-input" type="text" id="inputHex-${fullKeyNoSpaces}"
                        title="Edit hex value of color" placeholder="Hex color">
                    </div>
                </div>`;
            break;
        case 'float-range':
            if(propInfo.range) {
                // break propInfo.range into min and max
                propInfo.min = propInfo.range[0];
                propInfo.max = propInfo.range[1];
            }
            editorDivText += `<div class="col m-auto">
                    <input class="form-range" type="range" id="inputNeat-${fullKeyNoSpaces}"
                    min="${propInfo.min ?? 0}" max="${propInfo.max ?? 1}" step="${propInfo.step ?? 0.01}">
                </div>`;
            break;
        case 'int':
            editorDivText += `<div class="col">
                    <input class="form-control" type="number" id="inputNeat-${fullKeyNoSpaces}">
                </div>`;
            break;
        case 'int-dropdown':
            if (doInputRecord) {
                rawInputMinWidth = '10ch';
                rawInputColClass = 'col-2';
                editorDivText += `<div class="col w-1">
                    <div class="input-group">
                        <input id="inputRecord-${fullKeyNoSpaces}" record-input-for="inputNeat-${fullKeyNoSpaces}" type="text"
                        placeholder="Record input" class="form-control record-input"
                        title="Press any key or mouse click in this box to record its input ID. To exit, click out of this box."
                        oncontextmenu="return false;">
                        `;
            } else {
                editorDivText += `<div class="col w-25">`;
            }
            editorDivText += `<select id="inputNeat-${fullKeyNoSpaces}" placeholder="Type to search value..." autocomplete="off"
                        class="mw-100">
            `;
            // editorDivText += `<option value="" disabled selected>Unset</option>`;
            // add the options inside the select
            for (const [optionValue, optionContents] of Object.entries(propDropdownValues)) {
                editorDivText += `<option value="${optionValue}">${optionContents}</option>`;
            }
            editorDivText += `
                        </select>
                    ${doInputRecord ? '</div>' : ''}`+ /* close input recorder if it and its input group was made */ `
                </div>`;  // close div around dropdown select
            break;
        case 'intlist':
            rawInputColClass = 'col-7';
            editorDivText += `<div class="col">
                    <button id="btnIntlistAdd-${fullKeyNoSpaces}" type="button"
                    class="btn btn-secondary" title="Erase parameter value" aria-label="Erase parameter value">
                        <i class="bi-plus-lg"></i>Add
                    </button>
                </div>`;
            break;
        case 'string':
        default:
            editorDivText += `<div class="col">
                    <input class="form-control" type="text" id="inputNeat-${fullKeyNoSpaces}">
                </div>`;
            break;
    }
    // add eraser
    editorDivText += `<div class="col p-0 col-auto d-flex flex-row justify-content-end">
            <button id="btnErase-${fullKeyNoSpaces}" type="button"
            class="btn btn-outline-secondary h-100 py-0 px-2 border-0 invisible"
            title="Erase parameter value" aria-label="Erase parameter value">
                <i class="fs-5 bi-eraser-fill"></i>
            </button>
        </div>`;
    // add raw value
    editorDivText += `<div class="col ${rawInputColClass}" style="min-width:${rawInputMinWidth}">
                    <input class="form-control raw-input" type="text" id="inputRaw-${fullKeyNoSpaces}" name="${fullKeyNoSpaces}"
                    title="Actual raw value that the save file will hold" placeholder="no value" disabled>
                </div>`;
    editorDivText += `</div>`; // close inner row
        
    editorSurroundingElem.append(editorDivText);
    // add editor part into editor row
    row.append(
        editorSurroundingElem
    );

    // add entire property editor row into its category collapse
    //  putting it into the DOM
    propCollapseElem.append(row[0]);  // [0] because it's a jQuery object at first

    //----------------------------------------
    // setup tooltips
    
    // help icon tooltip
    let helpElem = document.getElementById(`propHelp-${fullKeyNoSpaces}`);
    if(helpElem) {
        let tooltip = new bootstrap.Tooltip(helpElem);
        paramsFormTooltipList.push(tooltip);
    }
    // warning icon tooltips
    let useIn1Indicator = document.querySelector(`#useIn1-${fullKeyNoSpaces}>i.yes-warning`);
    let useIn2Indicator = document.querySelector(`#useIn2-${fullKeyNoSpaces}>i.yes-warning`);
    let useIn1tooltip = new bootstrap.Tooltip(useIn1Indicator);
    let useIn2tooltip = new bootstrap.Tooltip(useIn2Indicator);
    useIn1tooltip.disable();  // disable the warning toolips by default
    useIn2tooltip.disable();  // disable the warning toolips by default
    paramsFormTooltipList.push(useIn1tooltip);
    paramsFormTooltipList.push(useIn2tooltip);

    //----------------------------------------
    // setup tomselects

    let selectElem = document.querySelector(`select#inputNeat-${fullKeyNoSpaces}`);
    // console.log('tomselect\'s selectElem:', selectElem);
    if(selectElem) {
        // start the select as empty
        selectElem.value = '';
        // let tomselect = new TomSelect("#select-beast",{
        let tomselect = new TomSelect(selectElem, {
            create: false,
            sortField: 
                    propInfo.sort === 'false' || propInfo.sort === false
                        ? undefined
                        : {
                field: "text"
                // direction: "asc"
            },
            maxOptions: null  // default was 50; this will allow ALL <option> s to show
        });
        paramsFormTomSelectList.push(tomselect);
    }

    //----------------------------------------
    // setup intlist editor
    let btnIntlistAddElem = document.getElementById(`btnIntlistAdd-${fullKeyNoSpaces}`);
    if(btnIntlistAddElem) {
        // let intlistColElem = btnAddElem.parentElement.parentElement.parentElement;
        let intlistColElem = btnIntlistAddElem.closest('.editor-surrounding-col');
        intlistColElem.intlist = []; // initialize the list of values (currently empty)
        // add btn listener
        btnIntlistAddElem.onclick = (e) => {
            // value + the space char will essentially add an element to the end of the list, as it splits by single spaces.
            // if not specified, default element is a 0.
            let newValue = (currentSaveData.get(fullKey)
                        ? currentSaveData.get(fullKey)+' '
                        : ''
                    )+(propInfo.default ?? 0);
            updateEditorRow(fullKeyNoSpaces, newValue);
        }
    }

    //----------------------------------------
    // setup updating listeners where applicable

    // setup input recorder
    let inputRecordElem = document.getElementById(`inputRecord-${fullKeyNoSpaces}`);
    if(inputRecordElem) {
        setupInputRecorder(inputRecordElem, (ucode) => updateEditorRow(fullKeyNoSpaces, ucode));
    }

    // setup raw editor
    let rawEditor = $(`#inputRaw-${fullKeyNoSpaces}`);
    rawEditor.change((e) => updateEditorRow(fullKeyNoSpaces, rawEditor.val()));

    // setup neat editor(s)
    let neatEditor = $(`#inputNeat-${fullKeyNoSpaces}`);
    switch (type) {
        case 'float-range':
            neatEditor.on('input', (e) => updateEditorRow(fullKeyNoSpaces, neatEditor.val()));
            break;
        case 'bool':
            neatEditor.change((e) => updateEditorRow(fullKeyNoSpaces, neatEditor[0].checked));
            break;
        case 'color':
            let textHexEditor = document.getElementById(`inputHex-${fullKeyNoSpaces}`);
            textHexEditor.addEventListener('change', e => updateEditorRow(fullKeyNoSpaces, textHexEditor.value));
            neatEditor.change((e) => updateEditorRow(fullKeyNoSpaces, neatEditor.val()));
            break;
        default:
            neatEditor.change((e) => updateEditorRow(fullKeyNoSpaces, neatEditor.val()));
            break;
    }

    // setup erase button
    let eraseBtn = document.getElementById(`btnErase-${fullKeyNoSpaces}`);
    eraseBtn.onclick = (e) => updateEditorRow(fullKeyNoSpaces, '');

    // return the created row
    return row;
}

function tryGetEditorRow(fullKeyNoSpaces) {
    return document.getElementById(`editorRow-${fullKeyNoSpaces}`);
}

function removeEditorRow(fullKeyNoSpaces) {
    let editorRow = document.getElementById(`editorRow-${fullKeyNoSpaces}`);
    if(editorRow === null) {
        console.error(`removeEditorRow: row for "${fullKeyNoSpaces}" did not exist!`);
    }
    // dispose of tooltips from all elements that should have tooltips
    editorRow.querySelectorAll(`[data-bs-toggle="tooltip"]`).forEach((elemWithTooltip) => {
        let tooltip = bootstrap.Tooltip.getInstance(elemWithTooltip);
        if(!tooltip) {
            console.error(`removeEditorRow: expected tooltip for ${elemWithTooltip}; none found!`);
            return;
        }
        tooltip.dispose();
        paramsFormTooltipList = removeItemOnce(paramsFormTooltipList, tooltip);
    });
    // dispose of tomselects from all elements that should have tomselects
    editorRow.querySelectorAll(`#select`).forEach((elemMayHaveTomSelect) => {
        let tomselect = elemMayHaveTomSelect.tomselect;
        if(!tomselect) {
            console.log(`removeEditorRow: no tomselect for ${elemMayHaveTomSelect}`);
            return;
        }
        tomselect.destroy();
        paramsFormTomSelectList = removeItemOnce(paramsFormTomSelectList, tomselect);
    });
    // remove row from DOM
    editorRow.remove();
}

function updateEditorRow(fullKeyAmbiguous, newValue, usedInSaveVs) {
    // fullKeyAmbiguous may be either the fullKey or the selector safe converted fullKey.
    // disambiguate the two.
    const fullKeyNoSpaces = selectorSafeFullKey(fullKeyAmbiguous);
    let editorRow = tryGetEditorRow(fullKeyNoSpaces);
    if(editorRow === null) {
        console.error(`updateEditorRow: row for "${fullKeyNoSpaces}" did not exist!`);
        return;
    }
    const fullKey = editorRow.getAttribute('full-key');
    if(fullKeyAmbiguous !== fullKeyNoSpaces && fullKeyAmbiguous !== fullKey) {
        console.error(`disambiguating and extracting fullKey mismatch: ${fullKeyAmbiguous} !== ${fullKey}`);
        return;
    }

    let propInfo = getPropInfo(fullKey);
    const type = propInfo.type;
    editorRow.querySelector(`#editorRow-${fullKeyNoSpaces}`);

    // let saveType2 = $('#saveType2').val();
    let saveType1 = $('#saveType1').val(), saveType2 = $('#saveType2').val();

    // NOTICE that warning indicator update happens before currentSaveData gets modified!

    // update warning indicators if value is deemed invalid or not
    let validationInfo = getValidationInfo(fullKey, propInfo, newValue, saveType1, saveType2);
    let msg1 = validationInfo.warningV1, msg2 = validationInfo.warningV2;
    updateWarningIndicator(fullKeyNoSpaces, Boolean(msg1), true, false, msg1, usedInSaveVs?.usedInSaveV1);
    updateWarningIndicator(fullKeyNoSpaces, Boolean(msg2), false, !saveType2, msg2, usedInSaveVs?.usedInSaveV2);
    // let validNewValue = validationInfo.newValue;

    // save value to the current save properties-values map

    // "stringify" according to save file expectations!
    // Note: if/when becomes applicable, could do version specific handling here possibly?
    if(newValue === false) newValue = '0';
    else if(newValue === true) newValue = '1';
    if(typeof(newValue) === 'number') newValue = ''+newValue; // convert numbers (such as 0) to string
    if(Array.isArray(newValue)) newValue = newValue.join(' '); // convert arrays to a space-separated string

    // update underlying current save data map with value
    if(newValue === '' && !propInfo.required && type !== 'intlist') {
        // remove an empty value only if it isn't strictly needed or isn't an intlist (e.g. the loadout, which is okay with empty string values)
        currentSaveData.delete(fullKey);
    } else {
        currentSaveData.set(fullKey, newValue);
    }

    // update editors with value

    // update raw editor and neat editor(s)
    switch(type) {
        case 'bool':
            console.log('newValue:',newValue);
            $(`#inputRaw-${fullKeyNoSpaces}`).val(newValue);
            document.getElementById(`inputNeat-${fullKeyNoSpaces}`).checked = (newValue === '0' ? false : !!newValue); // truthy
            // apply a class for styling when it is unset (i.e. value erased)
            if(newValue===''||newValue===null||typeof(newValue)==="undefined") {
                document.getElementById(`inputNeat-${fullKeyNoSpaces}`).classList.add('switch-unset');
            } else {
                document.getElementById(`inputNeat-${fullKeyNoSpaces}`).classList.remove('switch-unset');
            }
            break;
        case 'int-dropdown':
            $(`#inputRaw-${fullKeyNoSpaces}`).val(newValue);
            let inputNeatDropdown = document.getElementById(`inputNeat-${fullKeyNoSpaces}`);
            if(inputNeatDropdown.tomselect)
                // handle value change through tomselect instead
                inputNeatDropdown.tomselect.setValue(newValue, true); // set silent to true
            else
                // no tomselect attached then. Regular dropdown
                inputNeatDropdown.value = newValue;
            break;
        case 'intlist':
            $(`#inputRaw-${fullKeyNoSpaces}`).val(newValue);
            // console.error('TODO implement intlist update!');
            let btnAdd = document.getElementById(`btnIntlistAdd-${fullKeyNoSpaces}`);
            // back it out to the entire col which contains the row which contains the col that this is in
            let intlistColElem = btnAdd.closest('.editor-surrounding-col');
            const intlistToSet = Array.isArray(newValue) ? newValue
                                : newValue ? newValue.split(' ').filter(v=>v!==''&&typeof(v)!=="undefined")
                                : [];
            console.log('intlistToSet:', intlistToSet);

            let i;
            for (i = intlistColElem.children.length - 1; i >= 0; i--) {
                const rowElem = intlistColElem.children[i];
                if(!rowElem.classList.contains('intlist-item-row')) {
                    // not an editor
                    continue;
                }
                console.log('i:',i,'rowElem:',rowElem);
                let editor, tomselect;
                editor = rowElem.querySelector('input');
                tomselect = rowElem.querySelector('select')?.tomselect;
                if(i >= intlistToSet.length) {

                    // remove extra editor
                    if(tomselect) {
                        tomselect.destroy();
                        let i = paramsFormTomSelectList.indexOf(tomselect);
                        if(i > -1)
                            paramsFormTomSelectList.splice(i, 1);
                    }
                    // remove the extra int from the column's intlist
                    intlistColElem.intlist.splice(
                        rowElem.listindex,
                        1);
                    console.log('intlistColElem.intlist after splice:', intlistColElem.intlist);
                    rowElem.remove();

                } else {

                    // edit editor
                    if(tomselect) {
                        tomselect.setValue(intlistToSet[i], true); // set silent to true
                    } else {
                        editor.value = intlistToSet[i];
                    }
                    intlistColElem.intlist[i] = intlistToSet[i];

                }
            }
            // console.log('i after going through rowElems:', i);
            // make more if needed
            // i = intlistColElem.children.length;
            i = intlistColElem.querySelectorAll('.intlist-item-row').length;
            // i = intlistColElem.children.length - 1;  // -1 because the last one is the add btn and raw value and etc.
            while (i < intlistToSet.length) {
                // addIntlistElem(intlistColElem, fullKeyNoSpaces,
                //     intlistChangeCallback, intlistChangeCallback,
                //     undefined, propDropdownValues);
                let propDropdownValues = resolveDropdownFromPropInfo(propInfo, saveType1, saveType2);
                console.log('updateEditorRow: propDropdownValues:', propDropdownValues);
                addIntlistElem2(intlistColElem, fullKeyNoSpaces, intlistToSet[i] ?? propInfo.default, propDropdownValues);
                i++;
            }

            // $(`#inputRaw-${fullKeyNoSpaces}`).val(saveDataValue);
            // const intlistToSet = Array.isArray(saveDataValue) ? saveDataValue
            //                     : saveDataValue ? saveDataValue.split(' ').filter(v=>v!==''&&typeof(v)!=="undefined")
            //                     : [];
            // console.log('intlistToSet:', intlistToSet);
            // const intlistColElem = document.getElementById(`btnIntlistAdd-${fullKeyNoSpaces}`).closest('.save-data-val');
            // let i;
            // for (i = intlistColElem.children.length - 1; i >= 0; i--) {
            //     const rowElem = intlistColElem.children[i];
            //     if(!rowElem.classList.contains('intlist-item-row')) {
            //         // not an editor
            //         continue;
            //     }
            //     console.log('i:',i,'rowElem:',rowElem);
            //     let editor, tomselect;
            //     editor = rowElem.querySelector('input');
            //     tomselect = rowElem.querySelector('select')?.tomselect;
            //     if(i >= intlistToSet.length) {
            //         // remove extra editor
            //         if(tomselect) {
            //             tomselect.destroy();
            //             let i = paramsFormTomSelectList.indexOf(tomselect);
            //             if(i > -1)
            //                 paramsFormTomSelectList.splice(i, 1);
            //         }
            //         // remove the extra int from the column's intlist
            //         intlistColElem.intlist.splice(
            //             rowElem.listindex,
            //             1);
            //         console.log('intlistColElem.intlist after splice:', intlistColElem.intlist);
            //         rowElem.remove();
            //     } else {
            //         // edit editor
            //         if(tomselect) {
            //             tomselect.setValue(intlistToSet[i], true); // set silent to true
            //         } else {
            //             editor.value = intlistToSet[i];
            //         }
            //         intlistColElem.intlist[i] = intlistToSet[i];
            //     }
            // }
            // // console.log('i after going through rowElems:', i);
            // // make more if needed
            // i = intlistColElem.children.length;
            // while (i < intlistToSet.length) {
            //     addIntlistElem(intlistColElem, fullKeyNoSpaces,
            //         intlistChangeCallback, intlistChangeCallback,
            //         undefined, propDropdownValues);
            //     i++;
            // }

            break;
        case 'color':
            let hexmatch = newValue?.match(HEX_COL_PATTERN), savematch = newValue?.match(SAVE_COL_PATTERN);
            $(`#inputRaw-${fullKeyNoSpaces}`).val(hexmatch ? hexToSave(newValue) : newValue);
            $(`#inputNeat-${fullKeyNoSpaces}`).val(savematch ? saveToHex(newValue) : newValue);
            $(`#inputHex-${fullKeyNoSpaces}`).val(savematch ? saveToHex(newValue) : hexmatch ? newValue : '');
            break;
        default:
            $(`#inputRaw-${fullKeyNoSpaces}`).val(newValue);
            $(`#inputNeat-${fullKeyNoSpaces}`).val(newValue);
            break;
    }

    // update erase button
    let eraseBtn = $(`#btnErase-${fullKeyNoSpaces}`);
    if(!newValue) eraseBtn.addClass('invisible');
    else eraseBtn.removeClass('invisible');
}

function getEditorRowsCollection() {
    return document.getElementsByClassName('editor-row');
}

function refreshParamsInForm() {
    // 1. find what properties should exist (using VERSION_DEFAULTS, VERSION_RELEVANTS, currentSaveData, ...)
    //      and get the values they should currently hold
    // 2. go through them and sync up the form
    //      (remove ones that exist that shouldn't; if exists, update; if not exists, add)

    var saveType1 = $('#saveType1').val();
    var saveType2 = $('#saveType2').val();

    console.log('save types:', saveType1, saveType2)

    // gather up the properties that should exist

    let save1RelevantPropsArr = [];
    let save2RelevantPropsArr = [];

    if(saveType1 && VERSION_RELEVANTS[saveType1]) {
        save1RelevantPropsArr = Object.keys(VERSION_RELEVANTS[saveType1])
    } else if(saveType1 === '') {
        // saveType1 was selected to "Unknown" i.e. "assume all".
        // Therefore, gather up all parameters.
        for(const [versionKey, propsMap] of Object.entries(VERSION_RELEVANTS)) {
            save1RelevantPropsArr = save1RelevantPropsArr.concat(Object.keys(propsMap));
        }
    }

    if(saveType2 && VERSION_RELEVANTS[saveType2]) {
        save1RelevantPropsArr = Object.keys(VERSION_RELEVANTS[saveType2])
    }

    var save1RelevantPropsSet = new Set(save1RelevantPropsArr);
    var save2RelevantPropsSet = new Set(save2RelevantPropsArr);

    // TODO: Toggle the USED IN indicators!!!!

    console.error('TODO: toggle the used-in indicator icons');

    // gather current properties' values where applicable

    let propsData = {
        // by default, set to undefined
        ...Object.fromEntries(Array.from(save1RelevantPropsSet, e=>[e,undefined])),
        ...Object.fromEntries(Array.from(save2RelevantPropsSet, e=>[e,undefined])),
        // override with some actual values
        ...currentSaveData?.size
                ? Object.fromEntries(currentSaveData)
                : (saveType1  // get defaults when there's no current save data
                    ? VERSION_DEFAULTS[saveType1]
                    : {})
    };
    console.log('propsData:', propsData);

    // remove any that are not supposed to be there

    {   /* Scope the editor rows collection */
        let editorRowsCollection = getEditorRowsCollection();
        for (const editorRow of editorRowsCollection) {
            const editorRowFullKey = editorRow.getAttribute('full-key');
            // check if should it be removed
            if (!(save1RelevantPropsSet.has(editorRowFullKey) || save2RelevantPropsSet.has(editorRowFullKey))) {
                console.log(`removing editor ${editorRowFullKey}`);
                removeEditorRow(selectorSafeFullKey(editorRowFullKey));
            }
        }
    }

    // go through properties that should exist,
    //   add if needed, and update them
    
    for (const [propFullKey, propValue] of Object.entries(propsData)) {
        let fullKeyNoSpaces = selectorSafeFullKey(propFullKey);
        let usedInSaveV1 = save1RelevantPropsSet.has(propFullKey);
        let usedInSaveV2 = save2RelevantPropsSet.has(propFullKey);
        let inSaveFile = currentSaveData.has(propFullKey);
        let propInfo = getPropInfo(propFullKey);
        // add if needed
        let editorRow = tryGetEditorRow(fullKeyNoSpaces);
        if(editorRow === null) {
            editorRow = addEditorRow(
                fullKeyNoSpaces,
                propFullKey,
                propInfo,
                saveType1, saveType2,
                usedInSaveV1, usedInSaveV2, inSaveFile
            );
        }
        // update property value
        updateEditorRow(propFullKey, propValue, {usedInSaveV1:usedInSaveV1, usedInSaveV2:usedInSaveV2});
    }

    refreshQuickActionAvailabilities(saveType1, saveType2);
}

function doCollapseAll(e) {
    document.querySelectorAll('button.accordion-button').forEach((collBtn) => {
        if(!collBtn.classList.contains('collapsed')) {
            collBtn.click();
        }
    })
}

function displayLoadingProgress(show, max) {
    let loadingDiv = document.getElementById('paramsRefreshing');
    if(!show) {
        loadingDiv.classList.add('d-none');
    } else {
        loadingDiv.classList.remove('d-none');
        max = max ?? 100;
        let bar = document.getElementById('paramsProgressBar');
        if(!bar) return;
        bar.setAttribute('aria-valuemax', 100);
        bar.setAttribute('aria-valuemin', 0);
        bar.setAttribute('aria-valuenow', 0);
        bar.firstElementChild.style["width"] = "0%";
    }
}
function updateLoadingProgress(current, max) {
    max = max ?? 100;
    let bar = document.getElementById('paramsProgressBar');
    if(!bar) return;
    bar.setAttribute('aria-valuenow', current);
    bar.firstElementChild.style["width"] = `${Math.round(current*100/max)}%`;
}



$(document).ready(function() {
    //
    // repopulateParamsForm(null,null);
    
    //-----------------------------------------
    // setup listeners

    // document.getElementById('btnManualDoFileFormData').onclick = doFileFormData;

    $('#saveType1').change((e) => updateGameVersionInfoOnPage(e, $('#saveType1').val()));
    // $('#saveType1').change((e) => updateGameVersionInfoOnPage(e, e.target.value));
    
    $('#fileForm').change((e) => {
        console.log('form change detected!');
        console.log('form change e.target:', e.target);
        
        // if the file select was changed,
        //   update currentSaveData.
        //   (A new file was likely uploaded.)
        if(e.target.id === 'fileSelect') {
            console.log('fileSelect change. updating currentSaveData.');
            readFile(document.getElementById('fileSelect').files[0], $('#saveType1').val(),
                (newSaveDataMap) => {
                    // if(currentSaveData && currentSaveData.size > 0) {
                    //     alert('The upload of this file will overwrite currently edited values. Are you sure?')
                    // }
                    currentSaveData = newSaveDataMap;
                    console.log('size:',currentSaveData.size);
                    refreshParamsInForm();
                }
            );
        }

        // return;
        // getFileFormData();
        refreshParamsInForm();
    });

    //-----------------------------------------
    // perform page updates and initialization

    attemptOpenAccordionFromWindowHash();

    populateVersionDropdowns();
    populateManifestTable();
    updateGameVersionInfoOnPage(null, $('#saveType1').val());

    createParamsFormCollapses();  // create them only once
    
    function _afterSaveDataLoaded() {
        displayLoadingProgress(true, 100);
        refreshParamsInForm();
        displayLoadingProgress(false);
    }

    let saveType1 = $('#saveType1').val();
    let fileSelectElem = document.getElementById('fileSelect');
    if(fileSelectElem.files[0]) {
        readFile(fileSelectElem.files[0], saveType1,
            (newSaveDataMap) => {
                currentSaveData = newSaveDataMap;
                console.log('size:',currentSaveData.size);
                // refreshParamsInForm();
                _afterSaveDataLoaded();
            }
        );
    } else {
        currentSaveData = saveType1 ? new Map(Object.entries(VERSION_DEFAULTS[saveType1])) : {};
        _afterSaveDataLoaded();
    }

    // getFileFormData();
    // displayLoadingProgress(true, 100);
    // refreshParamsInForm();
    // displayLoadingProgress(false);
});

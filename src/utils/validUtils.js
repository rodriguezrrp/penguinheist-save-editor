import { getPropInfo, resolveDropdownFromPropInfo, versionInfo } from "../data";
import { partsToKey } from "./keyUtils";
import { getRelevantsFor } from "./saveDataUtils";

// Short-circuiting, and saving a parse operation
export function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

export function isEmptyOrNullOrUndefined(value) {
    return (value === "" || value === null || typeof(value) === "undefined")
}

export const SAVE_COL_PATTERN = /^((0(\.\d+)?|1);){3}(0(\.\d+)?|1)$/g;
export const HEX_COL_PATTERN = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/gi;

/** According to UnityEngine.Color32, conversion between 0-255 and 0-1 is done by dividing and multiplying by 255.
 * #000000  <==>  0;0;0;1
 * #ffffff  <==>  1;1;1;1
 */
export function saveToHex(saveCol) {
    if(!saveCol.match(SAVE_COL_PATTERN)) return null;
    let rgbaArr = saveCol.split(';');
    let res = '#' + rgbaArr.map(n => (Math.round(parseFloat(n)*255)).toString(16)).map(n => n.length === 1 ? '0'+n : n).join('');
    // trim off alpha part of #rrggbbaa if alpha was 1 as in x;x;x;1
    return res.length === 9 && res.endsWith('ff') ? res.substring(0, 7) : res;
}
/** According to UnityEngine.Color32, conversion between 0-255 and 0-1 is done by dividing and multiplying by 255.
 * #000000  <==>  0;0;0;1
 * #ffffff  <==>  1;1;1;1
 */
export function hexToSave(hexCol) {
    if(!hexCol.match(HEX_COL_PATTERN)) return null;
    let rgbaArr = HEX_COL_PATTERN.exec(hexCol).slice(1);
    return rgbaArr.map(n => n === undefined ? '1' : (parseInt(n,16)/255).toPrecision(7).replaceAll(',','.').replaceAll(/\.?0+$/g,'')).join(';');
}

function preparePropInfoMinMax(propInfo, fullKey) {
    if(typeof(propInfo.range)!=="undefined") {
        if(Array.isArray(propInfo.range) && propInfo.range.length === 2) {
            propInfo.min = Number(propInfo.range[0]);
            propInfo.max = Number(propInfo.range[1]);
        } else {
            console.error(`(for fullKey "${fullKey}") propInfo.range exists, but is not an array with two numbers!`);
        }
    } else {
        propInfo.min = Number(propInfo.min ?? 0);
        propInfo.max = Number(propInfo.max ?? 0);
    }
}


/**
 * @template V
 * @param {V} editorValue 
 * @param {string} keyBase 
 * @param {string} keyExtra 
 * @param {any} version 
 * @returns {{value: V; validity: boolean | null; warning: string | null}}
 * */
export function saveDataValueValidate(editorValue, keyBase, keyExtra, version) {
    console.log('saveDataValueValidate called for', editorValue);
    const fullKey = partsToKey(keyBase, keyExtra);
    /** @type {{value: V; validity: boolean | null; warning: string | null}} */
    const result = {value: editorValue, warning: null};
    
    if(!getRelevantsFor(version).includes(fullKey)) {
        result.validity = null;
        return result;
    }
    
    const propInfo = getPropInfo(fullKey);
    const type = propInfo.type;

    if(!propInfo.required && isEmptyOrNullOrUndefined(editorValue) && type !== "intlist") {
        result.validity = true;
        return result;
    }

    switch (type) {
        case "bool":
            if(editorValue === true) editorValue = '1';
            else if(editorValue === false) editorValue = '0';
            result.value = editorValue;
            if(editorValue !== '1' && editorValue !== '0') {
                result.warning = 'Expects the value to be 1 or 0 (true or false)!';
                result.validity = false;
            } else {
                result.validity = true;
            }
            break;
        case "int":
            if(!isInt(editorValue)) {
                result.warning = 'Expects the value to be a number!';
                result.validity = false;
            } else {
                result.validity = true;
            }
            break;
        case "float-range":
            preparePropInfoMinMax(propInfo, fullKey);
            if(propInfo.min && Number(editorValue) < propInfo.min) {
                result.warning = `Expects the value to be > ${propInfo.min}!`;
                result.validity = false;
            }
            else if(propInfo.max && Number(editorValue) > propInfo.max) {
                result.warning = `Expects the value to be < ${propInfo.max}!`;
                result.validity = false;
            }
            else {
                result.validity = true;
            }
            break;
        case "color":
            if(!editorValue.match(SAVE_COL_PATTERN) && !editorValue.match(HEX_COL_PATTERN)) {
                result.warning = 'Expects the value to be a valid color! (R;G;B;A and each value is 0-1)';
                result.validity = false;
            } else {
                if(editorValue.match(HEX_COL_PATTERN))
                    // provide an alternate value
                    result.value = hexToSave(editorValue);
                result.validity = true;
            }
            break;
        case "int-dropdown":
            // verify the new value is within the expected dropdown values (ex., cannot expect new items in an old version of the game)
            result.validity = true;
            if(version) {
                let dropdownValuesForVersion = resolveDropdownFromPropInfo(propInfo, version);
                if(!dropdownValuesForVersion[editorValue]) {
                    result.warning = `Selected save version does not expect the value "${editorValue}"`;
                    result.validity = false;
                }
            }
            break;
        case "intlist":
            result.validity = true;
            // allow empty list '', and consider undefined as an empty list also
            if((editorValue!=='' && typeof(editorValue)!=="undefined")) {
                if (editorValue.split(' ').some(v=>!isInt(v))) {
                    result.warning = 'Expects whole numbers in every position in the list (space-separated)!'
                    result.validity = false;
                } else {
                    // check if loadout size is valid (this is a key-specific check)
                    if(fullKey === 'previousLoadout') {
                        let lsize = getMaxLoadoutSize(version);
                        if(lsize && editorValue.split(' ').length > lsize) {
                            result.warning = `Loadout list cannot hold more than ${lsize} items, in selected version!`
                            result.validity = false;
                        }
                    }
                    // check if all values in the list are allowed
                    if(propInfo.dropdown) {
                        console.error('TODO: check if all values from dropdowns in intlist are allowed');
                        console.log('editorValue:', editorValue);
                        let dropdownValues = version ? resolveDropdownFromPropInfo(propInfo, version) : null;
                        // combine into two arrays, one array for each saveType, reduced by concatenating missing elems elementwise.
                        // each saveType's array contains all keys that were not in its accepted dropdown values.
                        let keysMissingFrom1 = editorValue.split(' ').map((listitem) => (
                            dropdownValues && !dropdownValues.hasOwnProperty(listitem)
                                ? listitem : undefined
                        )).reduce((accumValue, curValue) => (
                            // // AND elementwise (side effect: turns undefined into false!)
                            // accumValue && curValue,
                            // accumValue[1] && curValue[1]
                            // include elements that were missing elementwise
                            curValue ? accumValue.concat(curValue) : accumValue
                        ), []); // start reduce with empty array
                        // provide validation messages
                        if(dropdownValues && keysMissingFrom1.length > 0) {
                            let pluralize = keysMissingFrom1.length !== 1;
                            result.warning = `Value${pluralize?'s':''} ${keysMissingFrom1.join(', ')} ${pluralize?'are':'is'} not expected for selected version!`
                            result.validity = false;
                        }
                    }
                }
            }
            break;
        case "string":
            result.validity = true;
            break;
        default:
            console.error(`Unhandled type ${type} for key ${fullKey}`);
            result.validity = null;
            break;
    }
    if(typeof(result.validity)==="undefined") {
        // validity was not set; set it to false here, and provide warning to get it handled.
        console.error(`(fullKey ${fullKey}) Error: Did not determine validity of value`, editorValue);
        result.validity = false;
        result.warning = `Error, the validity of value was not determined`;
    }
    // return true;
    // const propInfo = getPropInfo(keyBase);
    return result;
}



// TODO: do test cases on this function!
// console.error('TODO: do test cases on _isValidVersion!');
function _isValidVersion(v) {
    return versionInfo.hasOwnProperty(v);
}

// TODO: do test cases on this function!
// console.error('TODO: do test cases on compareVersion!');
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
    let diff = versionInfo[v1].steamdb_buildid - versionInfo[v2].steamdb_buildid;
    if(isNaN(diff)) {
        // let _missingBID = (versionInfo[v1].steamdb_buildid?[]:['v1']).concat(versionInfo[v2].steamdb_buildid?[]:['v2']);
        // throw new Error(`compareVersion: ${_missingBID.join(', ')} must have a valid steamdb_buildid property in versionInfo!`);
        if(!(versionInfo[v1].steamdb_buildid))
            console.info(`compareVersion: v1 "${v1}" did not have a valid steamdb_buildid property in versionInfo!`);
        if(!(versionInfo[v2].steamdb_buildid))
            console.info(`compareVersion: v2 "${v2}" did not have a valid steamdb_buildid property in versionInfo!`);
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
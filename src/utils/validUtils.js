import { getPropInfo, resolveDropdownFromPropInfo, versionInfo } from "../data";
import { partsToKey } from "./keyUtils";
import { isRelevant } from "./saveDataUtils";
import { listDelim } from "./saveFileEncodingUtils.mjs";

// Short-circuiting, and saving a parse operation
export function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

// const FLOAT_REGEX = /^[+-]?[0-9]*([0-9]\.|\.[0-9]+)?(e[+-]?[0-9]*)?$/i
const FLOAT_REGEX = /^[+-]?[0-9]*([0-9]|[0-9]\.|\.[0-9]+)(e[+-]?[0-9]*)?$/i

/* TODO: Tests:
YES examples:
    1.0
    1
    .0
    0
    01.0
    10
    01
    1e0
    00E0
    1.0e2
    1.e2
    .1e2
    10e2
    10e22
    1e-3
    1e+3
    99e-22
    99e-020
    00E0
    .123
    12.345
    .123e-0
    1112.e+9
    111.111e111
NO examples:
    .
    111.111e111.1
 */
export function isFloat(value, inCommaLocale) {
    if (isNaN(value)) {
        return false;
    }
    if(typeof(value) === "number") {
        return true;
    }
    if(typeof(value) === "string") {
        if(inCommaLocale) {
            // remove any thousands periods, replace deliminating comma with period
            value = value.replaceAll('.', '').replaceAll(',', '.');
        }
        // return parseFloat(value) === ;
        return value.match(FLOAT_REGEX);
    }
    return false;
}

export function isEmptyOrNullOrUndefined(value) {
    return (value === "" || value === null || typeof(value) === "undefined")
}

export function saveValStrToList(/**@type {string|null|undefined}*/saveDataStr, delim = listDelim) {
    if(saveDataStr === null || typeof(saveDataStr) === "undefined") {
        return saveDataStr;
    }
    return saveDataStr.split(delim);
}
export function saveValListToStr(/**@type {any[]|null|undefined}*/saveDataStrAsList, delim = listDelim) {
    return saveDataStrAsList?.join(delim);
}
export function saveValListPush(/**@type {string|null|undefined}*/saveDataStr, /**@type {string}*/newValue, delim = listDelim) {
    if(saveDataStr === null || typeof(saveDataStr) === "undefined") {
        return saveDataStr;
    }
    return saveDataStr + delim + newValue;
}

export const SAVE_COL_PATTERN = /^((0(\.\d+)?|(1(\.0+)?));){3}(0(\.\d+)?|(1(\.0+)?))$/g;
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
    if(typeof(propInfo.range) !== "undefined") {
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
 * @param {V | undefined} editorValue 
 * @param {string} keyBase 
 * @param {string} keyExtra 
 * @param {any} version 
 * @returns {V | undefined}
 * */
export function saveDataValueAdjust(editorValue, keyBase, keyExtra, version) {
    const fullKey = partsToKey(keyBase, keyExtra);
    return saveDataValueAdjustUsingPropInfo(editorValue, getPropInfo(fullKey), version);
}

/**
 * @template V
 * @param {V | undefined} editorValue 
 * @param {any} propInfo 
 * @param {any} version 
 * @returns {V | undefined}
 * */
export function saveDataValueAdjustUsingPropInfo(editorValue, propInfo, version) {
    let customDelim = propInfo.delim || listDelim;
    const type = propInfo.type;
    let adjustedValue = editorValue;
    switch(type) {
        case "bool":
            if(editorValue === true)
                adjustedValue = '1';
            else if(editorValue === false)
                adjustedValue = '0';
            break;
        case "color":
            if(editorValue?.match(HEX_COL_PATTERN))
                // provide an alternate value for the raw representation of the color
                adjustedValue = hexToSave(editorValue);
            break;
        case "colorlist":
            if((editorValue !== '' && typeof(editorValue) !== "undefined")) {
                // convert any hex color values to their proper save file representation
                adjustedValue = editorValue?.split(customDelim).map(c => c.match(HEX_COL_PATTERN) ? hexToSave(c) : c).join(customDelim);
            }
            break;
        default:
    }
    return adjustedValue;
}

/**
 * @template V
 * @param {V} editorValue 
 * @param {string} keyBase 
 * @param {string} keyExtra 
 * @param {any} version 
 * @param {string?} customDelim 
 * @returns {{value: V; validity: boolean | null; warning: string | null}}
 * */
export function saveDataValueValidate(editorValue, keyBase, keyExtra, version, customDelim) {
    if(!customDelim) customDelim = listDelim;
    
    // console.log('saveDataValueValidate called for', editorValue);
    const fullKey = partsToKey(keyBase, keyExtra);
    
    const adjustedValue = saveDataValueAdjust(editorValue, keyBase, keyExtra, version, customDelim);
    
    /** @type {{value: V; validity: boolean | null; warning: string | null}} */
    const result = {value: adjustedValue, warning: null};
    
    if(!isRelevant(fullKey, version)) {
        result.validity = null;
        return result;
    }
    
    const propInfo = getPropInfo(fullKey);
    const type = propInfo.type;

    if(!propInfo.required && isEmptyOrNullOrUndefined(editorValue) && type !== "intlist" && type !== "colorlist") {
        result.validity = true;
        return result;
    }

    const delimMsg = (customDelim === ' ' ? '(space-separated)' : `(separated by "${customDelim}")`);

    switch (type) {
        case "bool":
            // using the adjusted value, where it should be appropriately converted to '0' or '1'
            if(adjustedValue !== '1' && adjustedValue !== '0') {
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
                // if no dropdown entry exists for the key value expected
                const _editorValueAsString = String(editorValue);
                if(!dropdownValuesForVersion.some(([k,]) => String(k) === _editorValueAsString)) {
                    result.warning = `Selected save version does not expect the value "${editorValue}"`;
                    result.validity = false;
                }
            }
            break;
        case "intlist":
            result.validity = true;
            // allow empty list '', and consider undefined as an empty list also
            if((editorValue !== '' && typeof(editorValue) !== "undefined")) {
                if (editorValue.split(customDelim).some(v=>!isInt(v))) {
                    result.warning = `Expects whole numbers in every position in the list ${delimMsg}!`
                    result.validity = false;
                } else {
                    // check if loadout size is valid (this is a key-specific check)
                    if(fullKey === 'previousLoadout') {
                        let lsize = getMaxLoadoutSize(version);
                        if(lsize && editorValue.split(customDelim).length > lsize) {
                            result.warning = `Loadout list cannot hold more than ${lsize} items, in selected version!`
                            result.validity = false;
                        }
                    }
                    // check if all values in the list are allowed
                    if(propInfo.dropdown) {
                        let dropdownValues = version ? resolveDropdownFromPropInfo(propInfo, version) : null;
                        let keysMissing = editorValue.split(customDelim).filter((listitem) => {
                            // if no dropdown entry exists for the key value expected
                            return !dropdownValues?.some(([k,]) => String(k) === listitem);  // listitem is always string, due to split() above
                        });

                        // provide validation messages
                        if(dropdownValues && keysMissing.length > 0) {
                            let pluralize = keysMissing.length !== 1;
                            result.warning = `Value${pluralize?'s':''} ${keysMissing.join(', ')} ${pluralize?'are':'is'} not expected for selected version!`
                            result.validity = false;
                        }
                    }
                }
            }
            break;
        case "colorlist":
            // note: colorlist currently uses ' ' as its deliminator so it is hardcoded.
            result.validity = true;
            // allow empty list '', and consider undefined as an empty list also
            if((adjustedValue !== '' && typeof(adjustedValue) !== "undefined")) {
                if (adjustedValue.split(' ').some(c => !c.match(SAVE_COL_PATTERN))) {
                    result.warning = `Expects valid colors in every position in the list ${delimMsg}! Colors are like R;G;B;A and each value is a decimal 0-1`
                    result.validity = false;
                    break;
                }
                // check if list size is valid (this is a key-specific check)
                if(keyBase === 'outfitColors') {
                    let osize = getMaxOutfitSize(version);
                    if(osize && adjustedValue.split(' ').length > osize) {
                        result.warning = `Outfit list cannot hold more than ${osize} items, in selected version!`
                        result.validity = false;
                        break;
                    }
                }
            }
            break;
        case "outfitindices":
            // note: outfitindices currently uses ' ' as its deliminator so it is hardcoded.
            result.validity = true;
            // allow empty list '', and consider undefined as an empty list also
            if((adjustedValue !== '' && typeof(adjustedValue) !== "undefined")) {
                // check if indices list size is valid
                let osize = getMaxOutfitSize(version);
                let lsize = osize + 1;
                const arr = adjustedValue.split(' ');
                if(osize && lsize && arr.length !== lsize) {
                    result.warning = `Outfit clothes and skin expects ${lsize} items total (${osize} clothes and ${1} skin), in selected version!`
                    result.validity = false;
                    break;
                }
                // check every item in it for validity
                let problemClothes = [], problemSkin = null;
                let clothesDD = resolveDropdownFromPropInfo(propInfo, version);
                let skinsDD = resolveDropdownFromPropInfo({...propInfo, dropdown: propInfo.dropdown2, dropdown_extra: propInfo.dropdown_extra2}, version);
                arr.forEach((listitem, i) => {
                    let dropdownValues = (i < osize ? clothesDD : skinsDD);
                    // if no dropdown entry exists for the list item (as the key id)
                    if(!dropdownValues?.some(([k,]) => String(k) === listitem)) {  // listitem is always string, due to split() above
                        if(i < osize) {
                            problemClothes.push(listitem);
                        } else {
                            problemSkin = listitem;
                        }
                    }
                });
                if(problemClothes.length || problemSkin !== null) {
                    let pluralizeClothes = problemClothes.length !== 1;
                    let pluralizeAll = (problemClothes.length + (problemSkin !== null) !== 1);
                    let both = problemClothes.length && problemSkin !== null;
                    result.warning = ``;
                    if(problemClothes.length)
                        result.warning += `Clothing value${pluralizeClothes?'s':''} ${problemClothes.map(v=>`"${v}"`).join(', ')}`;
                    if(both) result.warning += ' and ';
                    if(problemSkin !== null)
                        result.warning += `Skin value "${problemSkin}"`;
                    result.warning += ` ${pluralizeAll?'are':'is'} not expected for selected version!`;
                    result.validity = false;
                    break;
                }
            }
            break;
        case "furnituretransform":
            // note: furnituretransform currently uses ':' as its main deliminator and ',' as its inner,
            result.validity = true;
            //  using culture invariant float representation (i.e. always a period '.'), so it is hardcoded.
            const _parts = editorValue.split(':');
            if(_parts.length !== 3) {
                result.warning = 'Expects 3 parts separated by colons (":"); The furniture id, the position, and the rotation!'
                result.validity = false;
                break;
            }
            let [fId, pos, rot] = _parts;
            if(version) {  // only validate the furniture selection dropdown if version isn't the "unknown"/"any" version
                let dropdownValues = version ? resolveDropdownFromPropInfo(propInfo, version) : null;
                // if no dropdown entry exists for the key value expected
                if(!dropdownValues?.some(([k,]) => String(k) === fId)) {  // fId is always string, due to split() above
                    result.warning = `Expects a valid furniture Id as the first item in the list! Selected save version does not expect "${fId}"`
                    result.validity = false;
                    break;
                }
            }
            pos = pos.split(',');
            if(pos.length !== 3 || pos.some(v => !isFloat(v,false))) {
                result.warning = 'Expects a valid position as the second item in the list! Like x,y,z where x, y, and z are decimal numbers (using periods)';
                result.validity = false;
                break;
            }
            rot = rot.split(',');
            if(rot.length !== 4 || rot.some(v => !isFloat(v,false))) {  // quaternion. x y z w
                result.warning = 'Expects a valid rotation as the third item in the list! Like x,y,z,w where x, y, z, and w are decimal numbers (using periods). The rotation is a quaternion.';
                result.validity = false;
                break;
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

export function getMaxOutfitSize(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // currently all known/supported game versions have a fixed outfit size of 6.
    return 6;
}

function getMaxLoadoutSize(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // compareVersion returns positive when the first version is later than the second version.
    // therefore, when version is Post Office or later, the loadout size is 8. That's when it was upgraded.
    return compareVersion(version, 'vP') >= 0 ? 8 : 6;
}

export function versionHasStamps(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // stamps were introduced in Post Office update
    return compareVersion(version, 'vP') >= 0;
}

export function versionHasStructures(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // structures were replaced with blueprints in Blueprint update
    return compareVersion(version, 'vBP') < 0;
}

export function versionHasBlueprints(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // structures were replaced with blueprints in Blueprint update
    return compareVersion(version, 'vBP') >= 0;
}

export function versionHasLockableHeists(version) {
    if(typeof(version) === "undefined" || version === null) {
        return null;
    }
    // heists became progression-locked in the Heist Planner patch update
    return compareVersion(version, 'vCHP_initial') >= 0;
}
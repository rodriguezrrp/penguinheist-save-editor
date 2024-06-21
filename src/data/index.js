import { getKeyParts } from '../utils/keyUtils.js';
import { VERSION_INFO as versionInfo } from './version_info.js'; // todo change to json eventually?

// imports from json

const depotsInfo = require('./depots_info.json');
/**
 * name_map is for name, in case of keyExtra-based name replacement.
 * note provides a note about this property.
 * 
 * Type-specific parameters: If type is:
 *  - string, bool, int, or color: no extra parameters apply.
 *  - float-range: either range, both min and max, or neither apply.
 *  - intlist: any of dropdown and default apply, and separator may apply.
 *  - int-dropdown: dropdown and any of dropdown_extra, default, and sort apply.
 * @type {Record<string, {
 *   category: string,
 *   name: string,
 *   type: "string" | "bool" | "int" | "float-range" | "color" | "intlist" | "int-dropdown" | "colorlist" | "outfitindices",
 *   name_map?: "_self" | Record<string, any> | string,
 *   note?: string,
 *   range?: [number, number],
 *   min?: number,
 *   max?: number,
 *   dropdown?: "dropdown-items" | "dropdown-clothing" | "dropdown-skins" | "dropdown-graphics" | "dropdown-keybinds" | "dropdown-region" | "dropdown-heists",
 *   dropdown_extra?: Record<string, any>,
 *   default?: boolean,
 *   sort?: boolean
 * }>}
 * */
const mappedPropInfo = require('./mapped_prop_info.json');
const mappedCategoryInfo = require('./mapped_prop_categories.json');

const dropdownMaps = {};
// populate dropdown maps   (false: not recursive)
let req = require.context("./dropdowns", false, /\.json$/);
req.keys().forEach(key => {
    // notice it lowercases the filename key during matching and extracting.
    const _dropdownNameRegex = /dropdown-([a-z]+)\.json$/g; // regex is inside forEach to reset the global internal pointer
    let arr = _dropdownNameRegex.exec(key.toLowerCase());
    const dropdownName = (arr || [null,null])[1];

    let _reqresult = req(key);
    dropdownMaps[dropdownName] = _reqresult;
});
console.log('data index.js: aggregated dropdownMaps from json.', dropdownMaps);

const nameMapItems = require('./name_maps/item_name_map.json');
const nameMapClothing = require('./name_maps/clothing_name_map.json');
const nameMapFurniture = require('./name_maps/furniture_name_map.json');
const nameMapHousing = require('./name_maps/housing_name_map.json');



/** @typedef {string} version */
/** @typedef {string} key */

/** @type {Record<version, Record<key, string>>} */
const versionDefaults = {};

/** @type {Record<version, key[]>} */
const versionRelevants = {};

/** @type {Record<version, RegExp[]>} */
const versionRelevantRegex = {};


for (const [version, info] of Object.entries(versionInfo)) {
    if(!info.supported) {
        continue;
    }
    // incorporate the json files for each version into the overall mappings
    versionDefaults[version] = require(`./saves_default/mapped-${version}-default.json`);
    const { regex, single } = require(`./saves_relevant/mapped-${version}-relevant.json`);
    versionRelevants[version] = single;
    versionRelevantRegex[version] = regex.map(strToRegex);
}
if(!versionRelevants['']) {
    let s = new Set();
    Object.values(versionRelevants).forEach(arr => {
        arr.forEach(v => s.add(v));
    });
    versionRelevants[''] = [...s];
}
if(!versionRelevantRegex['']) {
    let s = new Set();
    Object.values(versionRelevantRegex).forEach(arr => {
        arr.forEach(v => s.add(v));
    });
    versionRelevantRegex[''] = [...s];
}
if(!versionDefaults['']) {
    versionDefaults[''] = {};  // for the "unknown"/"any" version, have no explicit defaults. Therefore relevant takes over.
}

console.log('data index.js: aggregated versionDefaults and versionRelevants from json.');

function strToRegex(regexAsStr) {
    const [, pattern, flags] = regexAsStr.match(/\/(.*)\/([a-z]*)/);
    return new RegExp(pattern, flags);
}



const defaultCategory = "unknown";

function getPropInfo(/**@type string*/fullKey) {
    const [keyBase, ] = getKeyParts(fullKey);
    // if there's no propInfo defined, default to a plain string editor, key as name, under the default category.
    return mappedPropInfo[keyBase]
            ?? {name: `@${fullKey}@`, category: defaultCategory, type: "string"};
}

/**
 * @returns {{name: string, expanded?: boolean, alwaysshow?: boolean}}
 * */
function getCategoryInfo(/**@type string*/categoryId) {
    return mappedCategoryInfo[categoryId];
}



function resolvePropInfoName(propInfo, propKeyExtra, placeholder='{name}') {
    if(!propInfo.name) return propInfo.name;
    if(propInfo.keyextra_separator) {
        // recursively call for each part of the keyExtra
        let propName = propInfo.name;
        propKeyExtra.split(propInfo.keyextra_separator).forEach((v, i) => {
            propName = resolvePropInfoName(
                { ...propInfo, name: propName, name_map: propInfo[`name_map${i}`], keyextra_separator: undefined },
                propKeyExtra = v, placeholder = `{name${i}}`);
        });
        return propName;
    } else {
        const propNameResult = _lookupPropInfoName(propInfo, propKeyExtra);
        const propName = propNameResult
            ? propInfo.name.replace(placeholder || '{name}', propNameResult)
            : propInfo.name;
        return propName;
    }
}

function _lookupPropInfoName(propInfo, propKeyExtra) {
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
                propNameMapResult = nameMapItems[propKeyExtra] ?? { 'name': propKeyExtra };
                break;
            case "clothing":
                propNameMapResult = nameMapClothing[propKeyExtra] ?? { 'name': propKeyExtra };
                break;
            case "housing":
                propNameMapResult = nameMapHousing[propKeyExtra] ?? { 'name': propKeyExtra };
                break;
            case "furniture":
                propNameMapResult = nameMapFurniture[propKeyExtra] ?? { 'name': propKeyExtra };
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
        propNameMapResult = propNameMap[propKeyExtra];
    }
    return propNameMapResult
        ? (
        typeof(propNameMapResult) === "string" || typeof(propNameMapResult) === "number"
            ? propNameMapResult
            : propNameMapResult.name
        )
        : propNameMapResult;
}


/**
 * Implementation note: should be updated along with resolveDropdownFromPropInfo(...),
 *  as the logic for dropdown data existence is matching,
 *  except this is stripped down for efficiency.
 * @returns {boolean}
 */
function propInfoHasDropdown(/**@type any?*/ propInfo) {
    if(!propInfo) return false;
    let type = typeof(propInfo.dropdown);
    if(type === "string" || type === "object" || typeof(propInfo.dropdown_extra) === "object") {
        return true;
    }
    return false;
}

/** @returns {[string, any][] | [string, {name: string, }][] | undefined} */
function resolveDropdownFromPropInfo(/**@type any?*/ propInfo, /**@type string?*/ version, /**@type boolean?*/ includeAllNameMapInfo = false) {
    let propDropdownValues;
    if(!propInfo) return propDropdownValues;

    const shouldSort = propInfo.sort !== false; // sort by default (i.e., if sort not specified);

    // get the dropdown's values
    if(typeof(propInfo.dropdown) === "string") {
        // resolve a possibly version-specific result
        propDropdownValues = resolveDropdown(propInfo.dropdown, version, shouldSort, includeAllNameMapInfo);
    } else if(typeof(propInfo.dropdown) === "object") {
        propDropdownValues = Object.entries(propInfo.dropdown);
        if(includeAllNameMapInfo) propDropdownValues = propDropdownValues.map((entry) => [entry[0], {name: entry[1]}]);
    }
    // add any extra values for this property
    if(typeof(propInfo.dropdown_extra) === "object") {
        let tmp = propDropdownValues || [];
        let extra = Object.entries(propInfo.dropdown_extra);
        if(includeAllNameMapInfo) extra = extra.map((entry) => [entry[0], {name: entry[1]}]);
        // NOTE: This will put a DUPLICATE KEY pair IF propInfo.dropdown_extra has
        //   a key that already exists in propDropdownValues entry array; NO override is performed.
        tmp = tmp.concat(extra);
        propDropdownValues = tmp;
    }
    return propDropdownValues;
}

console.info('TODO: cache the resolveDropdown results?');

const _VAL_MERGING_SEPARATOR = ' or ';

function resolveDropdown(/**@type string*/ dropdownRefName, /**@type string?*/ version, /**@type boolean?*/ sort, /**@type boolean?*/ includeAllNameMapInfo = false) {
    let dropdownValues = resolveDropdown_resolveChain(dropdownRefName, version, includeAllNameMapInfo);
    if(sort) {
        if(Array.isArray(dropdownValues)) {
            // sort by the entries' values (names)
            if(includeAllNameMapInfo) {
                // dropdownValues is an entry list with all namemap info like [id, {name: string, ...}][]
                return dropdownValues.sort((e1,e2)=>{
                    if(!e1[1].name?.localeCompare) {
                        console.error(e1);
                    }
                    return e1[1].name.localeCompare(e2[1].name)
                });
            } else {
                // dropdownValues is an entry list like [id, name][]
                return dropdownValues.sort((e1,e2)=>e1[1].localeCompare(e2[1]));
            }
        }
        console.error('Did not know how to handle sorting dropdownValues', dropdownValues);
        return dropdownValues;
    } else {
        return dropdownValues;
    }
}

function resolveDropdown_resolveChain(/**@type string*/ dropdownRefName, /**@type string?*/ version, /**@type boolean?*/ includeAllNameMapInfo = false) {
    let dropdownMap = dropdownMaps[dropdownRefName];
    if(!dropdownMap) return [];
    if(!dropdownMap.version_dependent) {
        let result = Object.entries(dropdownMap.values);
        if(includeAllNameMapInfo) {
            // console.info('dropdownMap.values:', dropdownMap.values);
            if(typeof(result[0][1])!=="string") {
                // console.log('dropdownMap.values:', dropdownMap.values);
                console.error('not string? debug this');
            }
            result = result.map((entry) => [entry[0], {name: entry[1]}]);
        }
        return result;
    }
    
    // handle version-dependent. Can involve inheritance, etc.

    /** @type {{[id: string]: string | { name: string; }}} */
    let resultVals = {};
    if(version) {
        if(dropdownMap.hasOwnProperty(version)) {
            resultVals = resolveDropdown_nameMapIfNeeded(dropdownMap[version], includeAllNameMapInfo) ?? {};
            // add in values from the chain of inheritance
            while(dropdownMap[version].inherit) {
                version = dropdownMap[version].inherit;
                // newest should override in the inheritance chain (newest is values already found)
                resultVals = {...resolveDropdown_nameMapIfNeeded(dropdownMap[version], includeAllNameMapInfo) ?? {}, ...resultVals};
            }
        } else {
            console.info(`dropdownMap for "${dropdownRefName}" had no data for version "${version}".`);
        }
        
        // if(!Object.entries(resultVals).every(entry => {
        //     let r;
        //     if(includeAllNameMapInfo) {
        //         r = typeof(entry[1]) === "object" && typeof(entry[1].name) === "string";
        //     } else {
        //         r = typeof(entry[1]) === "string";
        //     }
        //     if(!r) {
        //         console.log(entry);
        //     }
        //     return r;
        // })) {
        //     console.assert(
        //         'resultVals did not match expected \'shape\''
        //     );
        // }

    } else {
        // no specific version; gather all possible values
        Object.values(dropdownMap).forEach((data) => {
            const moreVals = resolveDropdown_nameMapIfNeeded(data, includeAllNameMapInfo);
            // console.assert(
            //     Object.entries(moreVals).every(e => {
            //         if(includeAllNameMapInfo) {
            //             return typeof(e[1]) === "object" && typeof(e[1].name) === "string";
            //         } else {
            //             return typeof(e[1]) === "string";
            //         }
            //     }),
            //     'moreVals did not have expected \'shape\''
            // )
            if(moreVals) {
                for(const [valKey, newVal] of Object.entries(moreVals)) {
                    if(resultVals.hasOwnProperty(valKey)) {
                        // if the two names don't match (newVal's name and resultVals[valKey]'s name)
                        
                        console.info('resultVals[valKey]:', resultVals[valKey]);

                        if((typeof(resultVals[valKey]) === "string"
                            ? resultVals[valKey] !== newVal
                            : resultVals[valKey].name !== newVal.name)  // <-- is this always undefined ????
                        ) {
                            // combine the names here
                            if(includeAllNameMapInfo) {
                                // resultVals[valkey] is not a string
                                // also it is already combined
                                // resultVals[valKey] = resultVals[valKey] + _VAL_MERGING_SEPARATOR + newVal;
                                // resultVals[valKey] = resultVals[valKey];
                            } else {
                                if(
                                    resultVals[valKey].includes(_VAL_MERGING_SEPARATOR)
                                    || newVal.includes(_VAL_MERGING_SEPARATOR)
                                ) {
                                    // union the strings so no duplicates get in
                                    resultVals[valKey] = [...new Set([
                                        ...resultVals[valKey].split(_VAL_MERGING_SEPARATOR),
                                        ...newVal.split(_VAL_MERGING_SEPARATOR)
                                    ])].join(_VAL_MERGING_SEPARATOR);
                                } else {
                                    resultVals[valKey] = resultVals[valKey] + _VAL_MERGING_SEPARATOR + newVal;
                                }
                            }
                        }
                    } else {
                        // resultVals didn't have an entry for valKey; just copy newVal (from moreVals) over.
                        resultVals[valKey] = newVal;
                    }
                }
            }
        });
    }
    let result = Object.entries(resultVals);
    if(includeAllNameMapInfo) {
        // console.info('resultVals:', resultVals);
        // if(typeof(result[0][1])!=="string") {
        //     console.error('not string? debug this');
        // }
        // result = result.map((entry) => [entry[0], {name: entry[1]}]);
    }
    return result;
}

/** @returns {{[id: string]: string | {name: string; }}} */
// /** @returns {[string, string | {name: string; }][]} */
function resolveDropdown_nameMapIfNeeded(dropdownMapResult, /**@type boolean?*/ includeAllNameMapInfo = false) {
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
                nameMap = nameMapItems;
                break;
            case "clothing":
                nameMap = nameMapClothing;
                break;
            case "housing":
                nameMap = nameMapHousing;
                break;
            case "furniture":
                nameMap = nameMapFurniture;
                break;
            default:
                console.error(`resolveDropdown_nameMapIfNeeded(): Unknown name map "${valuesNameMap}" referenced! Defaulting to null.`)
                nameMap = null;
                break;
        }
        if(nameMap === null)
            return {};

        // convert each value (from .values array) into a key-value pair with its nameMapInfo - conditionally to its .name prop - then to object
        /** @type {{[id: string]: string | {name: string; }}} */
        let nameMappedValuesObj = Object.fromEntries(dropdownMapResult.values.map((value) => 
            [value, includeAllNameMapInfo ? nameMap[value] : nameMap[value].name]
        ));

        // apply special remapping if applicable
        if(dropdownMapResult.value_remapping) {
            for(const [valuekey, alternate] of Object.entries(dropdownMapResult.value_remapping)) {
                if(typeof(alternate) === "undefined" || alternate === null) {
                    // remove from resulting values
                    delete nameMappedValuesObj[valuekey];
                } else {
                    let newNameMapInfo;
                    if(typeof(alternate) === "string" || typeof(alternate) === "number") {
                        // replace with the name (or info) from nameMap value of alternate
                        // nameMapValuesObj[valuekey] = nameMap[alternate].name;
                        newNameMapInfo = nameMap[alternate];
                    } else if(typeof(alternate) === "object") {
                        // alternate should contain alternate property values or possible operations to create them
                        // replace with the name (or info) from custom operation
                        newNameMapInfo = Object.fromEntries(
                            Object.entries(alternate).map((alternateEntry) => {
                                const [prop, op] = alternateEntry;
                                // if the key-value entry's value is an object, it should be an operation to generate the replacement.
                                // else, it is just a direct 'copy-paste' replacement.
                                if(typeof(op) !== "object") {
                                    return alternateEntry;
                                } else {
                                    let newVal = null;
                                    // apply operation to the new property for this name map result
                                    switch(op.operation) {
                                        case "concat":
                                            newVal = op.from_namemap_values.map(nmkey => nameMap[nmkey][prop]).join(op.delim);
                                            break;
                                        case "list":
                                            newVal = op.from_namemap_values.map(nmkey => nameMap[nmkey][prop]);
                                            break;
                                        case "raw":
                                            newVal = op.raw_value;
                                            break;
                                        default:
                                            console.error(`Unknown name map value remapping operation "${op.operation}"; defaulting value to null!`)
                                            newVal = null;
                                            break;
                                    }
                                    return [prop, newVal];
                                }
                            })
                        );
                    }
                    if(includeAllNameMapInfo) {
                        // console.log(valuekey, 'newNameMapInfo', newNameMapInfo);
                        nameMappedValuesObj[valuekey] = newNameMapInfo;
                    } else {
                        nameMappedValuesObj[valuekey] = newNameMapInfo.name;
                    }

                    // if(!Object.entries(nameMappedValuesObj).every(e => {
                    //     if(includeAllNameMapInfo) {
                    //         return typeof(e[1]) === "object" && typeof(e[1].name) === "string";
                    //     } else {
                    //         return typeof(e[1]) === "string";
                    //     }
                    // })) {
                    //     console.assert('nameMappedValuesObj did not match expected \'shape\'');
                    // }
                }
            }
        }
        return nameMappedValuesObj;
    }
    else {
        // dropdownMapResult.values was not an array;
        //  then, it is expected to be an object, of key-value mappings. (No namemapping!)

        /** @type {{[id: string]: string}} */
        let valsObj = dropdownMapResult.values;

        if(!valsObj) return {};
        if(includeAllNameMapInfo) {
            /** @type {{[id: string]: { name: string }}} */
            let newValsObj = {};
            // valsObj = Object.fromEntries(Object.entries(valsObj).map((entry) => [entry[0], {name: entry[1]}]));
            for(const key in valsObj) {
                if(valsObj.hasOwnProperty(key)) {
                    newValsObj[key] = { name: valsObj[key] };
                    console.assert(typeof(newValsObj[key].name) === "string", 'newValsObj[key].name was not a string?');
                }
            }
            return newValsObj;
        }
        return valsObj;
    }
}


// export function getAllNameMappedInfoFor(propInfo, version) {
//     /* If the result's .values is an array instead of an object (mapping),
//         create an object (mapping) from the array using the name map to make key-value pairs.
//         Otherwise, return the .values ?? {}.
//     */
//     if(Array.isArray(dropdownMapResult.values)) {
//         // there should be a name_map specified
//         const valuesNameMap = dropdownMapResult.name_map;
//         let nameMap = null;
//         switch (valuesNameMap) {
//             case "item":
//                 nameMap = nameMapItems;
//                 break;
//             case "clothing":
//                 nameMap = nameMapClothing;
//                 break;
//             case "housing":
//                 nameMap = nameMapHousing;
//                 break;
//             case "furniture":
//                 nameMap = nameMapFurniture;
//                 break;
//             default:
//                 console.error(`resolveDropdown_nameMapIfNeeded(): Unknown name map "${valuesNameMap}" referenced! Defaulting to null.`)
//                 nameMap = null;
//                 break;
//         }
//         if(nameMap === null)
//             return {};

//         // convert each value (from .values array) into a key-value pair with name, then to object
//         let nameMapValuesObj = Object.fromEntries(dropdownMapResult.values.map((value) => [value, nameMap[value].name]));
//         // apply special remapping if applicable
//         if(dropdownMapResult.value_remapping) {
//             for(const [value, alternate] of Object.entries(dropdownMapResult.value_remapping)) {
//                 if(typeof(alternate) === "undefined" || alternate === null) {
//                     // remove from resulting values
//                     delete nameMapValuesObj[value];
//                 } else if(typeof(alternate) === "string" || typeof(alternate) === "number") {
//                     // replace with the name from nameMap value of alternate
//                     nameMapValuesObj[value] = nameMap[alternate].name;
//                 } else if(typeof(alternate) === "object") {
//                     // alternate should contain alternate property values or possible operations to create them
//                     // replace with the name from custom operation
//                     nameMapValuesObj[value] = Object.fromEntries(
//                         Object.entries(alternate).map((alternateEntry) => {
//                             // if the key-value entry's value is an object, it should be an operation to generate the replacement.
//                             // else, it is just a direct 'copy-paste' replacement.
//                             if(typeof(alternateEntry[1]) !== "object") {
//                                 return alternateEntry;
//                             } else {
//                                 const [prop, op] = alternateEntry;
//                                 let newVal = null;
//                                 // apply operation to the new property for this name map result
//                                 switch(op.operation) {
//                                     case "concat":
//                                         newVal = op.from_namemap_values.map(nmkey => nameMap[nmkey][prop]).join(op.delim);
//                                         break;
//                                     case "list":
//                                         newVal = op.from_namemap_values.map(nmkey => nameMap[nmkey][prop]);
//                                         break;
//                                     case "raw":
//                                         newVal = op.raw_value;
//                                         break;
//                                     default:
//                                         console.error(`Unknown name map value remapping operation "${op.operation}"; defaulting value to null!`)
//                                         newVal = null;
//                                         break;
//                                 }
//                                 return [prop, newVal];
//                             }
//                         })
//                     ).name;
//                 }
//             }
//         }
//         return nameMapValuesObj;
//     } else {
//         return dropdownMapResult.values ?? {};
//     }
// }


// todo note: could potentially read version from window.location.search get params (i.e. ?version=...)
export function getLatestSupportedVersion() {
    // initially supported version
    return Object.entries(versionInfo).find(([,info])=>info.supported)[0];
}



export {
    defaultCategory,
    mappedCategoryInfo,
    mappedPropInfo,
    depotsInfo,
    versionInfo,
    versionDefaults,
    versionRelevants,
    versionRelevantRegex,
    getPropInfo,
    getCategoryInfo,
    resolvePropInfoName,
    propInfoHasDropdown,
    resolveDropdownFromPropInfo
}
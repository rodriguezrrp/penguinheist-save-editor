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



function resolveDropdownFromPropInfo(/**@type any?*/ propInfo, /**@type string?*/ version) {
    let propDropdownValues;
    if(!propInfo) return propDropdownValues;

    const shouldSort = propInfo.sort !== false; // sort by default (i.e., if sort not specified);

    // get the dropdown's values
    if(typeof(propInfo.dropdown) === "string") {
        // resolve a possibly version-specific result
        propDropdownValues = resolveDropdown(propInfo.dropdown, version, shouldSort);
    } else if(typeof(propInfo.dropdown) === "object") {
        propDropdownValues = Object.entries(propInfo.dropdown);
    }
    // add any extra values for this property
    if(typeof(propInfo.dropdown_extra) === "object") {
        let tmp = propDropdownValues || [];
        // NOTE: This will put a DUPLICATE KEY pair IF propInfo.dropdown_extra has
        //   a key that already exists in propDropdownValues entry array; NO override is performed.
        tmp = tmp.concat(Object.entries(propInfo.dropdown_extra));
        propDropdownValues = tmp;
    }
    return propDropdownValues;
}

console.info('TODO: cache the resolveDropdown results?');

const _VAL_MERGING_SEPARATOR = ' or ';

function resolveDropdown(/**@type string*/ dropdownRefName, /**@type string?*/ version, /**@type boolean?*/ sort) {
    let dropdownValues = resolveDropdown_resolveChain(dropdownRefName, version);
    if(sort) {
        if(Array.isArray(dropdownValues))
            // sort by the entries' values
            return dropdownValues.sort((e1,e2)=>e1[1].localeCompare(e2[1]));
        console.error('Did not know how to handle sorting dropdownValues', dropdownValues);
        return dropdownValues;
    } else {
        return dropdownValues;
    }
}

function resolveDropdown_resolveChain(/**@type string*/ dropdownRefName, /**@type string?*/ version) {
    let dropdownMap = dropdownMaps[dropdownRefName];
    if(!dropdownMap) return [];
    if(!dropdownMap.version_dependent) {
        return Object.entries(dropdownMap.values);
    }
    
    // handle version-dependent. Can involve inheritance, etc.
    let vals = {};
    if(version) {
        if(dropdownMap.hasOwnProperty(version)) {
            vals = resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {};
            // add in values from the chain of inheritance
            while(dropdownMap[version].inherit) {
                version = dropdownMap[version].inherit;
                // newest should override in the inheritance chain (newest is values already found)
                vals = {...resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {}, ...vals};
            }
        } else {
            console.info(`dropdownMap for "${dropdownRefName}" had no data for version "${version}".`);
        }
    } else {
        // gather all possible values
        Object.values(dropdownMap).forEach((data) => {
            const moreVals = resolveDropdown_nameMapIfNeeded(data);
            if(moreVals) {
                for(const [key, newVal] of Object.entries(moreVals)) {
                    if(vals.hasOwnProperty(key) && vals[key] !== newVal) {
                        // combine the values here
                        vals[key] = vals[key] + _VAL_MERGING_SEPARATOR + newVal;
                    } else {
                        vals[key] = newVal;
                    }
                }
            }
        });
    }
    return Object.entries(vals);
}

/** @returns {{[id: string]: string}} */
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

        // convert each value (from .values array) into a key-value pair with name, then to object
        let nameMapValuesObj = Object.fromEntries(dropdownMapResult.values.map((value) => [value, nameMap[value].name]));
        // apply special remapping if applicable
        if(dropdownMapResult.value_remapping) {
            for(const [value, alternate] of Object.entries(dropdownMapResult.value_remapping)) {
                if(typeof(alternate) === "undefined" || alternate === null) {
                    // remove from resulting values
                    delete nameMapValuesObj[value];
                } else if(typeof(alternate) === "string" || typeof(alternate) === "number") {
                    // replace with the name from nameMap value of alternate
                    nameMapValuesObj[value] = nameMap[alternate].name;
                } else if(typeof(alternate) === "object") {
                    // alternate should contain alternate property values or possible operations to create them
                    // replace with the name from custom operation
                    nameMapValuesObj[value] = Object.fromEntries(
                        Object.entries(alternate).map((alternateEntry) => {
                            // if the key-value entry's value is an object, it should be an operation to generate the replacement.
                            // else, it is just a direct 'copy-paste' replacement.
                            if(typeof(alternateEntry[1]) !== "object") {
                                return alternateEntry;
                            } else {
                                const [prop, op] = alternateEntry;
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
                    ).name;
                }
            }
        }
        return nameMapValuesObj;
    } else {
        return dropdownMapResult.values ?? {};
    }
}


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
    resolveDropdownFromPropInfo
}
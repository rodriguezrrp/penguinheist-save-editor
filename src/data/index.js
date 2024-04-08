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
//console.log('require.context(...).keys():', req.keys());
req.keys().forEach(key => {
    // notice it lowercases the filename key during matching and extracting.
    const _dropdownNameRegex = /dropdown-([a-z]+)\.json$/g; // regex is inside forEach to reset the global internal pointer
    let arr = _dropdownNameRegex.exec(key.toLowerCase());
    //console.log('require.context', key, arr);
    const dropdownName = (arr || [null,null])[1];

    let _reqresult = req(key);
    //console.log(`require.context ... req(${key})`, _reqresult)
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
if(!versionDefaults['']) {
    versionDefaults[''] = {};  // for the "unknown" version, have no explicit defaults. Therefore relevant takes over.
}

console.log('data index.js: aggregated versionDefaults and versionRelevants from json.');

// const supportedVersionsInfo = Object.fromEntries(Object.entries(versionInfo).filter(([version, info]) => info.supported));

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
    // const propNameMap = propInfo.name_map;
    // let propNameMapResult;
    // // resolve name map if needed
    // if(typeof(propNameMap) === "string") {
    //     // it is referring to another known name map, not in the same file. could be version-dynamic.
    //     switch (propNameMap) {
    //         case "_self":
    //             propNameMapResult = { 'name': propKeyExtra };
    //             break;
    //         case "item":
    //             propNameMapResult = nameMapItems[propKeyExtra] ?? { 'name': propKeyExtra };
    //             break;
    //         case "clothing":
    //             propNameMapResult = nameMapClothing[propKeyExtra] ?? { 'name': propKeyExtra };
    //             break;
    //         case "housing":
    //             propNameMapResult = nameMapHousing[propKeyExtra] ?? { 'name': propKeyExtra };
    //             break;
    //         case "furniture":
    //             propNameMapResult = nameMapFurniture[propKeyExtra] ?? { 'name': propKeyExtra };
    //             break;
    //         // case "structure":
    //         //     propNameMap = NAME_MAP_STRUCTURE[propKeyExtra] ?? { 'name': propKeyExtra };
    //         //     break;
    //         default:
    //             console.error(`Unknown name map "${propNameMap}" referenced! Defaulting to null.`)
    //             propNameMapResult = null;
    //             break;
    //     }
    // } else if(typeof(propNameMap) === "object") {
    //     // console.log(propNameMap);
    //     // console.log(propKeyExtra, propNameMap[propKeyExtra]);
    //     propNameMapResult = propNameMap[propKeyExtra];
    // }
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
        // console.log(propNameMap);
        // console.log(propKeyExtra, propNameMap[propKeyExtra]);
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



function resolveDropdownFromPropInfo(propInfo, /**@type string*/ version) {
    let propDropdownValues;
    if(!propInfo) return propDropdownValues;
    const type = propInfo.type;
    // if(type === 'int-dropdown' || type === 'intlist') {
        // get the dropdown's values
        if(typeof(propInfo.dropdown) === "string") {
            // resolve a possibly version-specific result
            propDropdownValues = resolveDropdown(propInfo.dropdown, version);
            console.log('propDropdownValues:', propDropdownValues);
        } else if(typeof(propInfo.dropdown) === "object") {
            propDropdownValues = propInfo.dropdown;
        }
        // add any extra values for this property
        if(typeof(propInfo.dropdown_extra) === "object")
            propDropdownValues = {...propDropdownValues, ...propInfo.dropdown_extra};
    // }
    return propDropdownValues;
}

console.info('TODO: memoize the resolveDropdown results?')

function resolveDropdown(dropdownRefName, version) {
    // console.log('resolveDropdown');
    let dropdownMap = dropdownMaps[dropdownRefName];
    if(!dropdownMap) return {};
    if(!dropdownMap.version_dependent) {
        return dropdownMap.values;
    }
    // handle version-dependent. Can involve inheritance, etc.
    let vals1 = {};
    // let vals2 = {};
    // console.log('resolveDropdown: version:', version);
    if(version) {
        // let version = saveType1;
        vals1 = resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {};
        // add in values from the chain of inheritance
        while(dropdownMap[version].inherit) {
            version = dropdownMap[version].inherit;
            // newest should override in the inheritance chain (newest is values already found)
            vals1 = {...resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {}, ...vals1};
        }
    }
    // console.log('vals1', vals1);
    // if(saveType2 && (saveType2 !== saveType1)) {  // optimization shortcut to avoid performing the same calculations for the same saveType
    //     let version = saveType2;
    //     vals2 = resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {};
    //     // add in values from the chain of inheritance
    //     while(dropdownMap[version].inherit) {
    //         version = dropdownMap[version].inherit;
    //         // newest should override in the inheritance chain (newest is values already found)
    //         vals2 = {...resolveDropdown_nameMapIfNeeded(dropdownMap[version]) ?? {}, ...vals2};
    //     }
    // }
    // console.log('vals2', vals2);
    // return {...vals2, ...vals1}; // primary save's version overrides any duplicates from comparison's version
    return vals1;
}

/** @returns {{id: string}} */
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
        // convert each value into a key-value pair
        return Object.fromEntries(dropdownMapResult.values.map((value) => [value, nameMap[value].name]));
    } else {
        return dropdownMapResult.values ?? {};
    }
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
    // supportedVersionsInfo,
    getPropInfo,
    getCategoryInfo,
    resolvePropInfoName,
    resolveDropdownFromPropInfo,
    resolveDropdown
}
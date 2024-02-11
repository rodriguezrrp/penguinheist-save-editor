// imports from json
import { VERSION_INFO as versionInfo } from './version_info.js'; // change to json eventually?
const depotsInfo = require('./depots_info.json');
/**
 * name_map is for name, in case of keyExtra-based name replacement.
 * note provides a note about this property.
 * 
 * Type-specific parameters: If type is:
 *  - string, bool, int, or color: no extra parameters apply.
 *  - float-range: either range, both min and max, or neither apply.
 *  - intlist: any of dropdown and default apply.
 *  - int-dropdown: dropdown and any of dropdown_extra, default, and sort apply.
 * @type {Record<string, {
 *   category: string,
 *   name: string,
 *   type: "string" | "bool" | "int" | "float-range" | "color" | "intlist" | "int-dropdown",
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

/** @typedef {string} version */
/** @typedef {string} key */

/** @type {Record<version, Record<key, string>>} */
const versionDefaults = {};

/** @type {Record<version, key[]>} */
const versionRelevants = {};

for (const [version, info] of Object.entries(versionInfo)) {
    if(!info.supported) {
        continue;
    }
    // incorporate the json files for version into the overall mappings
    // an object mapping (keys -> default values)
    versionDefaults[version] = require(`./saves_default/mapped-${version}-default.json`);
    // an array (of the keys)
    versionRelevants[version] = require(`./saves_relevant/mapped-${version}-relevant.json`);
}
if(!versionRelevants['all']) {
    let s = new Set();
    Object.values(versionRelevants).forEach(arr => {
        arr.forEach(v => s.add(v));
    });
    versionRelevants['all'] = [...s];
}

function getPropInfo(/**@type string*/keyBase) {
    return mappedPropInfo[keyBase];
}

/**
 * @returns {{name: string, expanded?: boolean, alwaysshow?: boolean}}
 * */
function getCategoryInfo(/**@type string*/categoryId) {
    return mappedCategoryInfo[categoryId];
}

console.log('data index.js: aggregated versionDefaults and versionRelevants from json')

export {
    mappedCategoryInfo,
    mappedPropInfo,
    depotsInfo,
    versionInfo,
    versionDefaults,
    versionRelevants,
    getPropInfo,
    getCategoryInfo
}
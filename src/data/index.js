// imports from json
import { VERSION_INFO as versionInfo } from './version_info.js'; // change to json eventually?
const depotsInfo = require('./depots_info.json');
const mappedPropInfo = require('./mapped_prop_info.json');
const mappedCategoryInfo = require('./mapped_prop_categories.json');

const versionDefaults = {};
const versionRelevants = {};

for (const [version, info] of Object.entries(versionInfo)) {
    if(!info.supported) {
        continue;
    }
    // incorporate the json files for version into the overall mappings
    versionDefaults[version] = require(`./saves_default/mapped-${version}-default.json`);
    versionRelevants[version] = require(`./saves_relevant/mapped-${version}-relevant.json`);
}
if(!versionRelevants['all']) {
    let s = new Set();
    Object.values(versionRelevants).forEach(arr => {
        arr.forEach(v => s.add(v));
    });
    versionRelevants['all'] = [...s];
}

console.log('data index.js: aggregated versionDefaults and versionRelevants from json')

export {
    mappedCategoryInfo,
    mappedPropInfo,
    depotsInfo,
    versionInfo,
    versionDefaults,
    versionRelevants
}
// imports from json
import { VERSION_INFO as versionInfo } from './version_info.js'; // change to json eventually?
const depotsInfo = require('./depots_info.json');
const mappedPropInfo = require('./mapped_prop_info.json');
const mappedCategoryInfo = require('./mapped_prop_categories.json');

export {
    mappedCategoryInfo,
    mappedPropInfo,
    depotsInfo,
    versionInfo,
}
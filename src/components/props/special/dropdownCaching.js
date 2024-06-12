import { resolveDropdownFromPropInfo } from "../../../data";

// // regarding lazy and lazy-once, see https://webpack.js.org/api/module-methods/#webpackmode
// const imagesCtx = require.context(/* webpackModule: "preview-imgs-chunk-[index]" */ '../../../assets/imgs/furniture_previews_resized',
//     false, /\.(png|jpe?g|svg|webp)$/, 'lazy-once');// 'lazy');
// const imagesCache = {};
// imagesCtx.keys().forEach(filePath => {
//   // load the image
//   imagesCtx(filePath).then(module => {
//     console.log('filePath:', filePath);
//     console.log('module.default:', module.default);
//     imagesCache[filePath] = module.default;
//   });
// });

/**
 * @typedef {string} DropdownType
 * @typedef {option[] | { value: string, label: any, image?: any }[]} DropdownOptionsResult
 */


let previousVersion = null;
// const memoizationCache = new LRUCache({max:10});  <-- some kind of size-limited LRU map implementation?

/** @type {Map<DropdownType, Map<PropInfo, DropdownOptionsResult>>} */
let memoizationCache = new Map();


// export function getCacheTestImage() {
//     return imagesCache['minecart.webp'];
// }


/**
 * @param {PropInfo} propInfo
 * @param {string?} version
 * @param {DropdownType} dropdownType
 * @returns {DropdownOptionsResult}
 */
export function resolveDropdownOptionDataCached(propInfo, version, dropdownType) {
    
    if(version !== previousVersion) {
        // purge all old version's cached data
        for(const map of memoizationCache.values()) map.clear();
        memoizationCache.clear();
        memoizationCache = new Map();
        previousVersion = version;
    }

    // if it's already cached, retrieve and return it.
    if(memoizationCache.has(dropdownType)) {
        let m = memoizationCache.get(dropdownType);
        if(m.has(propInfo)) {
            // console.log('retrieved from cache for propInfo', propInfo, 'optionData', m.get(propInfo));
            return m.get(propInfo);
        }
    }
    
    let optionData;
    switch(dropdownType) {

        // react-select options format
        case "searchable": {
            let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
            optionData = (dropdownValues || []).map(([optValue, optContents]) => (
                { value: optValue, label: optContents }
            ));
            optionData.unshift({ value: '', label: '', disabled: true });
            break;
        };
        case "searchablewithimages": {
            let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
            optionData = (dropdownValues || []).map(([optValue, optContents]) => {
                // return { value: optValue, label: optContents, image: imagesCache['minecart.webp'] }
                return { value: optValue, label: optContents, image: null }
            });
            optionData.unshift({ value: '', label: '', disabled: true });
            break;
        };
        // normal <option>s format
        default:
            console.error(`Unhandled dropdownType "${dropdownType}"! Defaulting to "plain" behavior`);
        // eslint-disable-next-line no-fallthrough
        case "plain": {
            // console.time('resolve dropdown');
            let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
            // console.timeEnd('resolve dropdown');
            // console.time('prepare dropdownValues');
            optionData = (dropdownValues || []).map(([optValue, optContents]) => (
                <option value={optValue}>{optContents}</option>
            ));
            optionData.unshift(<option value="" disabled></option>);
            // console.timeEnd('prepare dropdownValues');
            break;
        };
    }
    
    let m = memoizationCache.get(dropdownType);
    if(!m) {
        m = new Map();
        memoizationCache.set(dropdownType, m);
    }
    // console.log('putting into cache for propInfo', propInfo, 'optionData', optionData);
    m.set(propInfo, optionData);

    return optionData;
}


import { propInfoHasDropdown, resolveDropdownFromPropInfo } from "../../../data";

let imagesCtxCaches = {};
let srcCaches = {};
export function getPreviewImagePromise(cacheType, imgnameNoExt) {
    if(!imagesCtxCaches[cacheType]) {
        // regarding lazy and lazy-once, see https://webpack.js.org/api/module-methods/#webpackmode
        if(cacheType === "furniture") {
            imagesCtxCaches.furniture = require.context(/* webpackModule: "preview-imgs-chunk-[index]" */ '../../../assets/imgs/furniture_previews_resized',
                false, /\.(png|jpe?g|svg|webp)$/i, 'lazy-once');
            srcCaches.furniture = new Map(imagesCtxCaches.furniture.keys().map(v => [v, null]));
        }
        else if(cacheType === "items") {
            imagesCtxCaches.items = require.context(/* webpackModule: "preview-imgs-chunk-[index]" */ '../../../assets/imgs/item_previews_resized',
                false, /\.(png|jpe?g|svg|webp)$/i, 'lazy-once');
            srcCaches.items = new Map(imagesCtxCaches.items.keys().map(v => [v, null]));
        }
        else {
            // preview images cache does not exist for this type :/
            console.log(`info: no preview images cache exists for cacheType ${cacheType}`);
            return undefined;
        }
    }

    let cache = imagesCtxCaches[cacheType];
    // console.log('getting preview image from cache:', imgnameNoExt);
    let fname = `./${imgnameNoExt}_50x50.webp`;
    let cachedSrc = srcCaches[cacheType].get(fname);

    if(typeof(cachedSrc) === "undefined") {  // mapping does not exist in the context
        return null;
    }
    else if(cachedSrc === null) {  // mapping exists in the context but was not retrieved yet
        // console.log('resolving preview image from webpack context cache:', imgnameNoExt);
        
        // returning a Promise (creating async situation)
        return cache(fname).then(src => {
            // automatically cache the resolved value before any other handling.
            srcCaches[cacheType].set(fname, src);
            return src;  // pass it along
        });
    }
    else {
        // mapping already was retrieved; return it directly (not async)
        return cachedSrc;
    }
}

/**
 * @typedef {string} DropdownType
 * @typedef {option[] | { value: string, label: any, image?: any }[]} DropdownOptionsResult
 */


let previousVersion = null;

/** @type {Map<DropdownType, Map<PropInfo, DropdownOptionsResult>>} */
let memoizationCache = new Map();


export function getCacheTestImagePromise() {
    // return imagesCache['./minecart_50x50.webp'];
    return getPreviewImagePromise('minecart');
}


/**
 * @param {PropInfo} propInfo
 * @param {string?} version
 * @param {DropdownType} dropdownType
 * @returns {DropdownOptionsResult | undefined}
 */
export function resolveDropdownOptionDataCached(propInfo, version, dropdownType) {

    if(!propInfoHasDropdown(propInfo)) return undefined;
    
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
            let dropdownValues = resolveDropdownFromPropInfo(propInfo, version, true);  // include all nameMap info
            optionData = (dropdownValues || []).map(([optValue, optContents]) => {
                // return { value: optValue, label: optContents, image: imagesCache['minecart.webp'] }
                // return { value: optValue, label: optContents, image: null }
                return {
                    value: optValue,
                    label: optContents.name,
                    group: optContents.group || optContents.category,
                    imgname: optContents.imgname || optContents.image,
                    imgcachetype: propInfo.dropdown,  // e.g. "items" or "furniture"
                    ispostoffice: optContents.post_office
                };
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


/** @returns {boolean | undefined} */
export function dropdownOptionsDataContainsValue(dropdownOptionsData, /**@type string*/ value) {
    return dropdownOptionsData?.some((opt => {
        if(opt.props) return String(opt.props?.value) === value;
        else return opt.value === value;
    }));
}
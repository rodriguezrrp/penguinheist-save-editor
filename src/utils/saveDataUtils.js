import { defaultCategory, mappedCategoryInfo, versionDefaults, versionRelevants, getPropInfo, versionRelevantRegex } from '../data';

if(!mappedCategoryInfo[defaultCategory]) {
    throw new Error(`Expecting default category "${defaultCategory}" in mapped category info!`)
}

export function getInitialVersion() {  // todo: could potentially read version from window.location.search get params (i.e. ?version=...)
    // return 'vHH_initial';
    return 'vCHP_latest';
}

// /**
//  * @returns {Record<string, string>}
//  */
// export function getInitialDefaults() {
//     return initialSaveDefaults;  // fabricated testing data
//     // return getDefaultsFor(getInitialVersion());
// }

// export function getInitialRelevants() {
//     // return initialSaveRelevants;  // fabricated testing data
//     // return versionRelevants[getInitialVersion()];
//     return getRelevantsFor(getInitialVersion());
// }

// export function getInitialRelevantsCategorized() {
//     // return initialSaveRelevantsCategorized;
//     // return categorizeRelevants(initialSaveRelevants);
//     return categorizeRelevants(getInitialRelevants());
// }


export function getDefaultsFor(version) {
    let defaults = versionDefaults[version];
    if(typeof(defaults)==="undefined") throw new Error(`defaults was undefined for version ${version}!`)
    return defaults;
}

export function getRelevantsFor(version) {
    let relevants = versionRelevants[version];
    if(typeof(relevants)==="undefined") throw new Error(`relevants was undefined for version ${version}!`)
    return relevants;
}

export function getRelevantRegexesFor(version) {
    let relevantRegexes = versionRelevantRegex[version];
    return Array.isArray(relevantRegexes) ? relevantRegexes : [];
}

export function isRelevant(fullKey, version) {
    const relevants = getRelevantsFor(version);
    return relevants.includes(fullKey) || getRelevantRegexesFor(version)?.some(reg => {
        // console.log(fullKey, reg, fullKey.match(reg));
        return fullKey.match(reg) });
}

// export function getRelevantsCategorizedFor(version) {
//     let relevants = getRelevantsFor(version);
//     return categorizeRelevants(relevants);
// }

// export function getDefaultsCategorizedFor(version) {
//     let defaults = getDefaultsFor(version);
//     return categorizeSaveDataRecord(defaults);
// }

/**
 * @param {string} version
 * @param {Map<string, string | undefined>
 *          | Record<string, string | undefined>
 *          | undefined} fileDataMap
 */
export function getCompleteCategorizedSaveDataFor(version, fileDataMap) {
    let newSaveDataObj;
    if(fileDataMap) {
        if(fileDataMap instanceof Map) {
            fileDataMap = Object.fromEntries(fileDataMap.entries());
        }
        newSaveDataObj = fileDataMap;
    } else {
        newSaveDataObj = getDefaultsFor(version);
    }
    /** @type {Record<string, string | undefined>} */
    let data = {
        ...Object.fromEntries(getRelevantsFor(version).map(key => [key, undefined])),
        // ...getDefaultsFor(version),      either default or fileDataMap, one or the other. together is causing problems
        // ...fileDataMap
        ...newSaveDataObj
    };
    return categorizeSaveDataRecord(data);
}

/**
 * @template V
 * @param {Record<string, V>} saveData
 * @returns {Record<string, Record<string, V>>}
 */
function categorizeSaveDataRecord(saveData) {
    // using Maps will keep insertion-order sorting by their nature in JS
    /** @type {Map<string, Map<string, string>>} */
    const categorized = new Map(Object.keys(mappedCategoryInfo).map(
        (catId) => [catId, new Map()]
    ));
    console.log('categorize: categorized initially:', categorized);
    // Set keeps insertion-order sorting by their nature in JS
    const deDupedDefaultsKeys = new Set(Object.keys(saveData));
    for(const fullKey of deDupedDefaultsKeys) {
        // const [keyBase, ] = getKeyParts(fullKey);
        // if property info doesn't exist, put in the default category
        const category = getPropInfo(fullKey)?.category || defaultCategory;
        // ensure categorized dict has the category in it, ready for mapping keys
        if(!categorized.has(category)) {
            throw new Error(`categorized map did not have category of id "${category}"`);
            // console.error(`category map did not have category of id "${category}". Putting in "unknown".`);
            // category = "unknown";
            // // using a Map will keep insertion-order sorted nature of mappings
            // categorized.set(category, new Map());
        }
        const keysDataMap = categorized.get(category);
        // console.log(keyBase);
        if(keysDataMap.has(fullKey)) {
            throw new Error(`value already existed for full key "${fullKey}" category "${category}"`);
        }
        let value = saveData[fullKey];
        keysDataMap.set(fullKey, value);
    }
    console.log('categorize: categorized:', categorized);

    // now restructure this into the desired "React-friendly" format
    // const restructured = Array.from(categorized).map(([keyCatId, valKeyMap]) => (
    //     {
    //         categoryId: keyCatId,
    //         keysData: Array.from(valKeyMap).map(([fullKey, keyExtras]) => (
    //             {
    //                 fullKey: fullKey,
    //                 value: keyExtras
    //             }
    //         ))
    //     }
    // ))
    const restructured = Object.fromEntries(Array.from(categorized).map(([keyCatId, valKeyMap]) => (
        [keyCatId, Object.fromEntries(valKeyMap.entries())]
    )));
    console.log('categorize: restructured:', restructured);
    return restructured;
}

// /**
//  * @param {string[]} relevantKeysList
//  * @returns {{categoryId: string, keysData: {keyBase: string, extras: string[]}[]}[]}
//  */
// function categorizeRelevants(relevantKeysList) {
//     // using Maps will keep insertion-order sorted nature of mappings
//     /** @type {Map<string, Map<string, string[]>>} */
//     const categorized = new Map(Object.keys(mappedCategoryInfo).map(
//         (catId) => [catId, new Map()]
//     ));
//     console.log('categorize: categorized initially:', categorized);
//     // Set keeps insertion-order sorted nature
//     const deDupedRelevants = new Set(relevantKeysList);
//     for(const fullKey of deDupedRelevants) {
//         const [keyBase, keyExtra] = getKeyParts(fullKey);
//         // if property info doesn't exist, put in the default category
//         const category = mappedPropInfo[keyBase]?.category || defaultCategory;
//         // ensure categorized dict has the category in it, ready for mapping keys
//         if(!categorized.has(category)) {
//             throw new Error(`categorized map did not have category of id "${category}"`);
//             // // using a Map will keep insertion-order sorted nature of mappings
//             // categorized.set(category, new Map());
//         }
//         const keysDataMap = categorized.get(category);
//         // console.log(keyBase);
//         if(!keysDataMap.has(keyBase)) {
//             keysDataMap.set(keyBase, []);
//         }
//         keysDataMap.get(keyBase).push(keyExtra);
//     }
//     console.log('categorize: categorized:', categorized);

//     // now restructure this into the desired "React-friendly" format
//     const restructured = Array.from(categorized).map(([keyCatId, valKeyMap]) => (
//         {
//             categoryId: keyCatId,
//             keysData: Array.from(valKeyMap).map(([keyBase, keyExtras]) => (
//                 {
//                     keyBase: keyBase,
//                     extras: keyExtras
//                 }
//             ))
//         }
//     ));
//     console.log('categorize: restructured:', restructured);
//     return restructured;
// }
/**
 * @template V
 * @param {Record<string, Record<string, V>>} categorizedSaveDataRecord 
 * @returns {Record<string, V>}
 */
export function decategorizeSaveData(categorizedSaveDataRecord) {
    return Object.fromEntries(Object.entries(categorizedSaveDataRecord)
                                .flatMap(([catId, catData]) => Object.entries(catData))
    );
}

export function combineSaveValuesConditionally(baseSaveData, extraSaveData, entryFilter) {
    if(!baseSaveData) return null;
    if(!extraSaveData) return baseSaveData;
    if(!entryFilter)
        entryFilter = ([fk, v]) => (v !== null && typeof(v) !== "undefined");
    return Object.fromEntries(Object.entries(baseSaveData).map(([catId, catData]) => [
        catId,
        {
            ...catData,
            ...(extraSaveData[catId] &&
                Object.fromEntries(Object.entries(extraSaveData[catId]).filter(entryFilter))
            )
        }
    ]));
}

// const initialSaveDefaults = {
//     'itemOwned 0': '0',
//     'itemOwned 29': '1',
//     'money': '150',
//     'todo actuallygeneratethis': '12345test'
// };

// const initialSaveRelevants = [
//     'itemOwned 0',
//     'itemOwned 29',
//     'itemOwned 18',
//     'money',
//     'todo actuallygeneratethis'
// ]

// const initialSaveRelevantsCategorized = [
//     {
//       categoryId: "category1",
//       keysData: [
//         { 
//           keyBase: 'itemOwned',
//           extras: [
//             '0',
//             '29',
//             '18',
//           ]
//         },
//         { 
//           keyBase: 'money',
//           extras: [
//             '',
//           ]
//         }
//       ],
//     },
//     {
//       categoryId: "category2",
//       keysData: [
//         { 
//           keyBase: 'todo',
//           extras: [
//             'actuallygeneratethis'
//           ]
//         }
//       ]
//     },
//   ];
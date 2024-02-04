import { mappedCategoryInfo, mappedPropInfo, versionRelevants } from '../data';
import { getKeyParts } from './keyUtils';

export const defaultCategory = "unknown";

if(!mappedCategoryInfo[defaultCategory]) {
    throw new Error(`Expecting default category "${defaultCategory}" in mapped category info!`)
}

export function getInitialVersion() {  // todo: could potentially read version from window.location.search get params (i.e. ?version=...)
    // return 'vHH_initial';
    return 'vCHP_latest';
}

export function getInitialDefaults() {
    return initialSaveDefaults;  // fabricated testing data
    // return getDefaultsFor(getInitialVersion());
}

export function getInitialRelevants() {
    return initialSaveRelevants;  // fabricated testing data
    // return versionRelevants[getInitialVersion()];
    // return getRelevantsFor(getInitialVersion());
}

export function getInitialRelevantsCategorized() {
    // return initialSaveRelevantsCategorized;
    // return categorizeRelevants(initialSaveRelevants);
    return categorizeRelevants(versionRelevants[getInitialVersion()]);
}


export function getDefaultsFor(version) {
    throw new Error()
}

export function getRelevantsFor(version) {
    // throw new Error()
    return versionRelevants[version];
}

export function getRelevantsCategorizedFor(version) {
    let relevants = getRelevantsFor(version);
    return categorizeRelevants(relevants);
}

function categorizeRelevants(relevantsList) {
    // using Maps will keep insertion-order sorted nature of mappings
    const categorized = new Map(Object.keys(mappedCategoryInfo).map(
        (catId) => [catId, new Map()]
    ));
    console.log('categorize: categorized initially:', categorized);
    // Set keeps insertion-order sorted nature
    let deDupedRelevants = new Set(relevantsList);
    for(const fullKey of deDupedRelevants) {
        const [keyBase, keyExtra] = getKeyParts(fullKey);
        // if property info doesn't exist, put in the default category
        const category = mappedPropInfo[keyBase]?.category || defaultCategory;
        // ensure categorized dict has the category in it, ready for mapping keys
        if(!categorized.has(category)) {
            throw new Error(`categorized map did not have category of id "${category}"`)
            // // using a Map will keep insertion-order sorted nature of mappings
            // categorized.set(category, new Map());
        }
        const keysDataMap = categorized.get(category);
        console.log(keyBase)
        if(!keysDataMap.has(keyBase)) {
            keysDataMap.set(keyBase, []);
        }
        keysDataMap.get(keyBase).push(keyExtra);
    }
    console.log('categorize: categorized:', categorized);

    // now restructure this into the desired "React-friendly" format
    const restructured = Array.from(categorized).map(([keyCatId, valKeyMap]) => (
        {
            categoryId: keyCatId,
            keysData: Array.from(valKeyMap).map(([keyBase, keyExtras]) => (
                {
                    keyBase: keyBase,
                    extras: keyExtras
                }
            ))
        }
    ))
    console.log('categorize: restructured:', restructured);
    return restructured;
}


const initialSaveDefaults = {
    'itemOwned 0': '0',
    'itemOwned 29': '1',
    'money': '150',
    'todo actuallygeneratethis': '12345test'
};

const initialSaveRelevants = [
    'itemOwned 0',
    'itemOwned 29',
    'itemOwned 18',
    'money',
    'todo actuallygeneratethis'
]

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
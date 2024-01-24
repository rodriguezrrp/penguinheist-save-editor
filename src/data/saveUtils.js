import { getKeyParts } from '../utils/keyUtils';
// import mappedPropInfo from './mapped_prop_info';
const mappedPropInfo = require('./mapped_prop_info');

export const defaultCategory = "unknown";

export function getInitialVersion() {
    return 'vHH_initial';
}

export function getInitialDefaults() {
    return initialSaveDefaults;
}

export function getInitialRelevantsCategorized() {
    // return initialSaveRelevantsCategorized;
    return categorizeRelevants(initialSaveRelevants);
}


export function getDefaultsFor(version) {
    throw new Error()
}

export function getRelevantsFor(version) {
    throw new Error()
}

export function getRelevantsCategorizedFor(version) {
    let relevants = getRelevantsFor(version);
    return categorizeRelevants(relevants);
}

function categorizeRelevants(relevantsList) {
    // put all categories and props into an object
    const categorized = new Map();
    // Set keeps insertion-order sorted nature
    let deDupedRelevants = new Set(relevantsList);
    for(const fullKey of deDupedRelevants) {
        const [keyBase, keyExtra] = getKeyParts(fullKey);
        const category = mappedPropInfo[keyBase]?.category || defaultCategory;
        // ensure categorized dict has the category in it, ready for mapping keys
        if(!categorized.has(category)) {
            // using a Map will keep insertion-order sorted nature of mappings
            categorized.set(category, new Map());
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

const initialSaveRelevantsCategorized = [
    {
      categoryId: "category1",
      keysData: [
        { 
          keyBase: 'itemOwned',
          extras: [
            '0',
            '29',
            '18',
          ]
        },
        { 
          keyBase: 'money',
          extras: [
            '',
          ]
        }
      ],
    },
    {
      categoryId: "category2",
      keysData: [
        { 
          keyBase: 'todo',
          extras: [
            'actuallygeneratethis'
          ]
        }
      ]
    },
  ];
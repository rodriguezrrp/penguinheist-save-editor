
export function getInitialState() {
    return 'vHH_initial';
}

export function getInitialRelevantsCategorized() {
    return initialSaveRelevantsCategorized;
}

export function getInitialDefaults() {
    return initialSaveDefaults;
}


const initialSaveDefaults = {
    'itemOwned 0': '0',
    'itemOwned 29': '1',
    'money': '150',
    'todo actuallygeneratethis': '12345test'
};

export const defaultCategory = "unknown";

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
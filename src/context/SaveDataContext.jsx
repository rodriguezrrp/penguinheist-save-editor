import { createContext, useContext, useReducer } from 'react';

const SaveDataContext = createContext(null);
const SaveDataDispatchContext = createContext(null);

export function SaveDataProvider({ version, children }) {
    console.log('SaveDataProvider, version:', version);
    const [saveData, dispatch] = useReducer(
        saveDataReducer,
        initialSaveData
    );

    return (
        <SaveDataContext.Provider value={saveData}>
            <SaveDataDispatchContext.Provider value={dispatch}>
                {children}
            </SaveDataDispatchContext.Provider>
        </SaveDataContext.Provider>
    )
}

export function useSaveData() {
    return useContext(SaveDataContext);
}

export function useSaveDataDispatch() {
    return useContext(SaveDataDispatchContext);
}

function saveDataReducer(data, action) {
    console.log('saveDataReducer: data:', data);
    console.log('saveDataReducer: action:', action);
}

const initialSaveData = [
    { 
        keyBase: 'itemOwned',
        extras: [
            { keyExtra: '0', value: '0' },
            { keyExtra: '29', value: '1' }
        ]
    },
    { 
        keyBase: 'money',
        extras: [
            { keyExtra: '', value: '150' }
        ]
    },
    { 
        keyBase: 'todo',
        extras: [
            { keyExtra: 'actuallygeneratethis', value: '12345test' }
        ]
    }
];

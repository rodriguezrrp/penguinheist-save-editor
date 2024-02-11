import { createContext, useContext, useRef, useCallback, useSyncExternalStore } from 'react';
import { getCompleteCategorizedSaveDataFor, getInitialVersion } from '../utils/saveDataUtils';
import { useVersion } from './VersionContext';
// import { VersionProvider } from './VersionContext';

// const PropListContext = createContext(null);

/**
 * @typedef {(categoryId: string, fullKey: string, newValue: string) => void} DataStoreSetFunction
 * @typedef {(newCategorizedData: Record<string, Record<string, string>>) => void} DataStoreSetAllFunction
 * @typedef {{ getAll: () => Record<string, Record<string, string>>,
 *            set: DataStoreSetFunction,
 *            setAll: DataStoreSetAllFunction,
 *            subscribe: (callback: any) => () => boolean
 *          }} DataStoreFunctions
 */

// const SaveDataContext = createContext(null);
// const SaveDataDispatchContext = createContext(null);
/** @type {React.Context<DataStoreFunctions>} */
const SaveDataContext = createContext(null);

/**
 * @param {string?} version 
 * @returns {DataStoreFunctions}
 */
function useStoreData(version) {
  // const store = useRef(getInitialDefaults());
  // const store = useRef(getDefaultsCategorizedFor(version ?? getInitialVersion()));
  version = version ?? getInitialVersion();
  const store = useRef(getCompleteCategorizedSaveDataFor(version));

  const getAll = useCallback(() => store.current, []);
  const subscribers = useRef(new Set());
  const set = useCallback((/**@type string*/ categoryId,
                          /**@type string*/ fullKey,
                          /**@type string*/ newValue) => {
    // store.current = { ...store.current, ...value };
    // if(typeof(newValue) === "undefined") {
    //   // remove fullKey from the store entirely.
    //   // separate the remainder via destructuring
    //   const {[fullKey]: _, ...rest} = store.current[categoryId];
    //   store.current = {
    //     ...store.current,
    //     // rest is the contents of store.current[categoryId] except for fullKey
    //     [categoryId]: rest
    //   };
    // } else {
      // newValue is a value.
    store.current = {
      ...store.current,
      // replace value of fullKey (in category categoryId) with newValue
      [categoryId]: {
        ...store.current[categoryId],
        [fullKey]: newValue
      }
    };
    // }
    return subscribers.current.forEach(callback => callback());
  }, []); 
  const setAll = useCallback((/**@type {Record<string, Record<string, string>>}*/ newCategorizedData) => {
    store.current = newCategorizedData;
    return subscribers.current.forEach(callback => callback());
  }, []);

  const subscribe = useCallback((callback) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  return { getAll, set, setAll, subscribe }
}

/**
 * @template T
 * @param {(data: Record<string, Record<string, string>>) => T} selector 
 * @returns {[T, DataStoreSetFunction]}
 */
export function useStore(selector) {
  // store should be the { getAll, set, setAll, subscribe } functions
  const store = useContext(SaveDataContext);
  // console.log(store);
  if(!store) throw new Error('store was not existing. Should be like { getAll, set, setAll, subscribe } functions');
  
  const state = useSyncExternalStore(store.subscribe, () => selector(store.getAll()));
  return [state, store.set];
}

/**
 * @template T
 * @param {(data: Record<string, Record<string, string>>) => T} selector 
 * @returns {[T, DataStoreSetAllFunction]}
 */
export function useStoreSetAll(selector) {
  // store should be the { getAll, set, setAll, subscribe } functions
  const store = useContext(SaveDataContext);
  // console.log(store);
  if(!store) throw new Error('store was not existing. Should be like { getAll, set, setAll, subscribe } functions');
  
  const state = useSyncExternalStore(store.subscribe, () => selector(store.getAll()));
  return [state, store.setAll];
}

/**
 * @returns {() => Record<string, Record<string, string>>}
*/
export function useStoreGetAll() {
  // store should be the { getAll, set, setAll, subscribe } functions
  const store = useContext(SaveDataContext);
  // console.log(store);
  if(!store) throw new Error('store was not existing. Should be like { getAll, set, setAll, subscribe } functions');
  
  return store.getAll;
}


export function SaveDataProvider({ children }) {
  console.log('SaveDataProvider created');
  // const [saveData, dispatch] = useReducer(
  //   saveDataReducer,
  //   initialSaveData
  // );

  // the save data context should re-calculate when version changes
  //   (? TODO NOTE: can this be moved out as a parameter of SaveDataProvider function?)
  const version = useVersion();

  return (
    // <SaveDataContext.Provider value={saveData}>
    //   <SaveDataDispatchContext.Provider value={dispatch}>
    //     {children}
    //   </SaveDataDispatchContext.Provider>
    // </SaveDataContext.Provider>
    <SaveDataContext.Provider value={useStoreData(version)}>
      {children}
    </SaveDataContext.Provider>
  );
}

// export function PropListProvider({ children }) {
//   console.log('PropListProvider');
//   const [propList, setPropList] = useState(getInitialRelevants());
//   return (
//     <PropListContext.Provider value={{get: propList, set: setPropList}}>
//       {/* <SetPropListContext.Provider value={setPropList}> */}
//         {children}
//       {/* </SetPropListContext.Provider> */}
//     </PropListContext.Provider>
//   )
// }

export function useSaveDataContext() {
  return useContext(SaveDataContext);
}

// export function useSaveData() {
//   return useContext(SaveDataContext);
// }

// export function useSaveDataDispatch() {
//   return useContext(SaveDataDispatchContext);
// }

// function saveDataReducer(data, action) {
//   console.log('saveDataReducer: data:', data);
//   console.log('saveDataReducer: action:', action);
//   switch(action.type) {
//     case 'edit':
//       return data.map(_keyData => {
//         if(_keyData.keyBase === action.keyBase) {
//           return {
//             keyBase: _keyData.keyBase,
//             extras: _keyData.extras.map(_extra => {
//               if(_extra.keyExtra === action.keyExtra) {
//                 // replace value with action.newValue
//                 return { keyExtra: _extra.keyExtra, value: action.newValue }
//               }
//               else return _extra; 
//             })
//           };
//         }
//         else return _keyData;
//       });
//     default:
//       throw new Error('Unknown action type: ' + action.type);
//   }
// }

// const initialSaveData = convertToReactSaveData([
//   { 
//     keyBase: 'itemOwned',
//     extras: [
//       { keyExtra: '0', value: '0' },
//       { keyExtra: '29', value: '1' }
//     ]
//   },
//   { 
//     keyBase: 'money',
//     extras: [
//       { keyExtra: '', value: '150' }
//     ]
//   },
//   { 
//     keyBase: 'todo',
//     extras: [
//       { keyExtra: 'actuallygeneratethis', value: '12345test' }
//     ]
//   }
// ]);
// const initialSaveData = [
//   {
//     categoryId: "category1",
//     keysData: [
//       { 
//         keyBase: 'itemOwned',
//         extras: [
//           { keyExtra: '0', value: '0' },
//           { keyExtra: '29', value: '1' }
//         ]
//       },
//       { 
//         keyBase: 'money',
//         extras: [
//           { keyExtra: '', value: '150' }
//         ]
//       }
//     ],
//   },
//   {
//     categoryId: "category2",
//     keysData: [
//       { 
//         keyBase: 'todo',
//         extras: [
//           { keyExtra: 'actuallygeneratethis', value: '12345test' }
//         ]
//       }
//     ]
//   },
// ];

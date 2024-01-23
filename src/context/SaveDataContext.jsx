import { createContext, useContext, useRef, useCallback, useSyncExternalStore } from 'react';
import { getInitialDefaults } from '../data/saveUtils';
// import { VersionProvider } from './VersionContext';

// const SaveDataContext = createContext(null);
// const SaveDataDispatchContext = createContext(null);
const StoreContext = createContext(null);

function useStoreData() {
  const store = useRef(getInitialDefaults());

  const get = useCallback(() => store.current, []);
  const subscribers = useRef(new Set());
  const set = useCallback((value) => {
    store.current = { ...store.current, ...value };
    return subscribers.current.forEach(callback => callback());
  }, []);

  const subscribe = useCallback((callback) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  return { get, set, subscribe }
}

export function useStore(selector) {
  // store should be the { get, set, subscribe }
  const store = useContext(StoreContext);
  // console.log(store);
  if(!store) throw new Error('store was not {get, set, subscribe}');
  
  const state = useSyncExternalStore(store.subscribe, () => selector(store.get()));
  return [state, store.set];
}

export function SaveDataProvider({ children }) {
  console.log('SaveDataProvider');
  // const [saveData, dispatch] = useReducer(
  //   saveDataReducer,
  //   initialSaveData
  // );

  return (
    // <SaveDataContext.Provider value={saveData}>
    //   <SaveDataDispatchContext.Provider value={dispatch}>
    //     {children}
    //   </SaveDataDispatchContext.Provider>
    // </SaveDataContext.Provider>
    <StoreContext.Provider value={useStoreData()}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStoreContext() {
  return useContext(StoreContext);
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

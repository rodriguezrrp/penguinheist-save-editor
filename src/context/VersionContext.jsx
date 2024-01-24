import { useState, createContext, useContext } from 'react';
import { getInitialVersion } from '../data/saveUtils';

const VersionContext = createContext(null);
const SetVersionContext = createContext(null);

export function VersionProvider({ children }) {
  console.log('VersionProvider');
  // const [saveData, dispatch] = useReducer(
  //   saveDataReducer,
  //   initialSaveData
  // );
  const [version, setVersion] = useState(getInitialVersion());

  return (
    <VersionContext.Provider value={version}>
      <SetVersionContext.Provider value={setVersion}>
        {children}
      </SetVersionContext.Provider>
    </VersionContext.Provider>
  )
}

export function useVersion() {
  return useContext(VersionContext);
}

export function useSetVersion() {
  return useContext(SetVersionContext);
}

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
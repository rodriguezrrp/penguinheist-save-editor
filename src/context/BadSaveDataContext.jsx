import { useState, createContext, useContext } from 'react';

/** @type {React.Context<{badline: (string|any), parts?: string[]}[]>} */
const BadSaveDataContext = createContext(null);

/** @type {React.Context<React.Dispatch<React.SetStateAction<{badline: (string|any), parts?: string[]}[]>>>} */
const SetBadSaveDataContext = createContext(null);

export function BadSaveDataProvider({ children }) {
  console.log('BadSaveDataProvider');
  const [badSaveData, setBadSaveData] = useState([]);

  return (
    <BadSaveDataContext.Provider value={badSaveData}>
      <SetBadSaveDataContext.Provider value={setBadSaveData}>
        {children}
      </SetBadSaveDataContext.Provider>
    </BadSaveDataContext.Provider>
  )
}

export function useBadSaveData() {
  return useContext(BadSaveDataContext);
}

export function useSetBadSaveData() {
  return useContext(SetBadSaveDataContext);
}
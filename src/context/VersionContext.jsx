import { useState, createContext, useContext } from 'react';
import { getLatestSupportedVersion } from '../data';

/** @type {React.Context<string>} */
const VersionContext = createContext(null);

const SetVersionContext = createContext(null);

export function VersionProvider({ children }) {
  // console.log('VersionProvider');
  const [version, setVersion] = useState(getLatestSupportedVersion());

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
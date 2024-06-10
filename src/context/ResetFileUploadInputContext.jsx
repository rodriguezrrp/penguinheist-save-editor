import { useState, createContext, useContext } from 'react';

/** @type {React.Context<()=>void>} */
const ResetFileUploadInputContext = createContext(null);

const SetResetFileUploadInputContext = createContext(null);

export function ResetFileUploadInputProvider({ children }) {
  console.log('ResetFileUploadInputProvider');
  const [resetFileUploadInput, setResetFileUploadInput] = useState(()=>{});

  return (
    <ResetFileUploadInputContext.Provider value={resetFileUploadInput}>
      <SetResetFileUploadInputContext.Provider value={setResetFileUploadInput}>
        {children}
      </SetResetFileUploadInputContext.Provider>
    </ResetFileUploadInputContext.Provider>
  )
}

export function useResetFileUploadInput() {
  return useContext(ResetFileUploadInputContext);
}

export function useSetResetFileUploadInput() {
  return useContext(SetResetFileUploadInputContext);
}
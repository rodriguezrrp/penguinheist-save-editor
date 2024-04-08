import { useState, createContext, useContext } from 'react';

/** @type {React.Context<string>} */
const EditorStyleContext = createContext(null);

const SetEditorStyleContext = createContext(null);

export function EditorStyleProvider({ children }) {
  console.log('EditorStyleProvider');
  // default to special property editors
  const [editorStyle, setEditorStyle] = useState('special');

  return (
    <EditorStyleContext.Provider value={editorStyle}>
      <SetEditorStyleContext.Provider value={setEditorStyle}>
        {children}
      </SetEditorStyleContext.Provider>
    </EditorStyleContext.Provider>
  )
}

export function useEditorStyle() {
  return useContext(EditorStyleContext);
}

export function useSetEditorStyle() {
  return useContext(SetEditorStyleContext);
}
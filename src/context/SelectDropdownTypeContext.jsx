import { useState, createContext, useContext } from 'react';

/** @type {React.Context<string>} */
const SelectDropdownTypeContext = createContext(null);

const SetSelectDropdownTypeContext = createContext(null);

export const possibleSelectDropdownTypes = {
  'plain': 'Plain',
  'searchable': 'Searchable',
  'searchablewithimages': 'Searchable with Image Previews'
};

export function SelectDropdownTypeProvider({ children }) {
  // console.log('SelectDropdownTypeProvider');
  // default to searchable selects
  const [selectDropdownType, setSelectDropdownType] = useState('searchable');

  return (
    <SelectDropdownTypeContext.Provider value={selectDropdownType}>
      <SetSelectDropdownTypeContext.Provider value={setSelectDropdownType}>
        {children}
      </SetSelectDropdownTypeContext.Provider>
    </SelectDropdownTypeContext.Provider>
  )
}

export function useSelectDropdownType() {
  return useContext(SelectDropdownTypeContext);
}

export function useSetSelectDropdownType() {
  return useContext(SetSelectDropdownTypeContext);
}
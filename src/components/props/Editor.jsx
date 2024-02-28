import { getKeyParts, partsToHtmlSafeKey } from "../../utils/keyUtils";
import { useStore } from "../../context/SaveDataContext";
import { useVersion } from "../../context/VersionContext";
import { isEmptyOrNullOrUndefined, saveDataValueValidate } from "../../utils/validUtils";
import { getPropInfo, resolvePropInfoName } from "../../data";
import { useState } from "react";

// export function Editor({ keyBase, keyExtra, keyValue }) {
// export function Editor({ keyBase, keyExtra }) {
export function Editor({ categoryId, fullKey }) {
  const [keyBase, keyExtra] = getKeyParts(fullKey);
  // console.log(`Editor created keyBase ${keyBase} keyExtra ${keyExtra}`);
  console.log(`Editor created "${keyBase}" "${keyExtra}"`);

  const htmlSafeKey = partsToHtmlSafeKey(keyBase, keyExtra);
  // const spacedKey = partsToKey(keyBase, keyExtra);
  
  // const dispatch = useSaveDataDispatch();
  // return (
  //   <div>
  //     <span>keyBase {keyBase} - keyExtra {keyExtra} - value {keyValue}</span>
  //     <br/>
  //     <input
  //       value={keyValue}
  //       onChange={e => {
  //         dispatch({
  //           type: 'edit',
  //           keyBase: keyBase,
  //           keyExtra: keyExtra,
  //           newValue: e.target.value
  //         });
  //       }}
  //     />
  //   </div>
  // );
  const [saveDataValue, setSaveData] = useStore((store) => {//console.log('key: '+spacedKey+' store:',store);
                                                            // return store[spacedKey]});
                                                            return store[categoryId][fullKey]});
  console.log('here right after useStore (Editor). value '+saveDataValue);

  const propInfo = getPropInfo(fullKey);

  // const propName = propInfo.name;
  const propName = resolvePropInfoName(propInfo, keyExtra);

  const version = useVersion(); // note this is causing a dependency on the version Context; should not be an issue for re-rendering

  // TODO Note: can optimize avoiding calling this twice by passing a function to useState directly. Perhaps by wrapping it in useCallback.
  // https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
  let _initialValidityResult = saveDataValueValidate(saveDataValue, keyBase, keyExtra, version);

  const [validity, setValidity] = useState(_initialValidityResult.validity);
  const [warning, setWarning] = useState(_initialValidityResult.warning);  // Note: may expand warnings into its own store? or incorporate warnings into value store?

  // Note: may cache this later with useCallback(...) (or useMemo(...)?) for optimization
  const handleValueUpdate = (editorsValue) => {
    const result = saveDataValueValidate(editorsValue, keyBase, keyExtra, version);
    const validatedValue = result.value;
    setValidity(result.validity);
    setWarning(result.warning);
    setSaveData(categoryId, fullKey, validatedValue);
  };

  return (
    <div id={'editorRow-'+htmlSafeKey} className="editor-row">
      {/* <span style={{display:'inline-block',width:'40vw'}}>keyBase {keyBase} - keyExtra {keyExtra}</span> */}
      <span style={{display:'inline-block',width:'40vw'}}>"{propName}" @{fullKey}@</span>
      
      {/* <span style={{display:'inline-block',width:'2rem',color:(isValid===null?'gray':isValid?'green':'red')}}>{isValid===null?'∅':isValid?'✔':'✘'}</span> */}
      <span style={{display:'inline-block',width:'2rem',
                    color:(validity===null?'gray':validity?'green':'red')}}
        title={warning}
      >
        {validity===null?'∅':validity?'✔':'✘'}
      </span>

      <input
        type="text"
        value={saveDataValue ?? ''} /* the '' is to keep the input "controlled" in React, in case saveDataValue isn't provided (null or undefined) */
        onChange={e => handleValueUpdate(e.target.value)}
      />

      <button type="button"
        // disabled={saveDataValue === '' || saveDataValue === null || typeof(saveDataValue) === "undefined"}
        disabled={isEmptyOrNullOrUndefined(saveDataValue)}
        onClick={e => handleValueUpdate(undefined)}
      >
        X
      </button>

      <input
        type="text"
        disabled
        value={saveDataValue ?? ''} /* the '' is to keep the input "controlled" in React incase saveDataValue isn't provided */
        // onChange={e => {
        //   setSaveData(categoryId, fullKey, e.target.value)
        // }}
        placeholder="No value"
      />

      <span> {propInfo.type}</span>
    </div>
  )

  // return <div id={'editorRow-'+htmlSafeKey} className="editor-row">
  //   <RichEditor type={} version={} otherstufflalalala={} />
  //   <erasorbuttonhere/>
  //   <RawEditorView value={} />
  // </div>
}

// function StringEditor() {
//   return (
//     //
//   );
// }
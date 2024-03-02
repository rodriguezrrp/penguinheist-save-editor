import { getKeyParts, partsToHtmlSafeKey } from "../../utils/keyUtils";
import { useStore } from "../../context/SaveDataContext";
import { useVersion } from "../../context/VersionContext";
import { HEX_COL_PATTERN, isEmptyOrNullOrUndefined, saveDataValueValidate, saveToHex } from "../../utils/validUtils";
import { getPropInfo, resolveDropdownFromPropInfo, resolvePropInfoName } from "../../data";
import { useState } from "react";
import { listDelim } from "../../utils/saveFileEncodingUtils.mjs";
import { handleKeyDown, handleMouseUp } from "../../utils/unityMapping";
import stopEvent from "../../utils/stopEvent";

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

      {/* <input
        type="text"
        value={saveDataValue ?? ''} // the '' is to keep the input "controlled" in React, in case saveDataValue isn't provided (null or undefined)
        onChange={e => handleValueUpdate(e.target.value)}
      /> */}
      <RichSingleValueEditor type={propInfo.type} propInfo={propInfo} version={version}
        saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
      >
        <button type="button"
          // disabled={saveDataValue === '' || saveDataValue === null || typeof(saveDataValue) === "undefined"}
          disabled={isEmptyOrNullOrUndefined(saveDataValue)}
          onClick={e => handleValueUpdate(undefined)}
          title="Erase property's value"
        >
          X
        </button>

        <input
          type="text"
          disabled
          readOnly={true}
          value={saveDataValue ?? ''} /* the '' is to keep the input "controlled" in React incase saveDataValue isn't provided */
          // onChange={e => {
          //   setSaveData(categoryId, fullKey, e.target.value)
          // }}
          placeholder="No value"
          title="Raw value in save file"
        />
      </RichSingleValueEditor>

      <span> {propInfo.type}</span>
    </div>
  )

  // return <div id={'editorRow-'+htmlSafeKey} className="editor-row">
  //   <RichEditor type={} version={} otherstufflalalala={} />
  //   <erasorbuttonhere/>
  //   <RawEditorView value={} />
  // </div>
}



function RichSingleValueEditor({ children, type, saveDataValue, handleValueUpdate, propInfo, version }) {
  console.log(`RichSingleValueEditor created ${type}`);
  let inputElem = null;
  let isList = false;
  let dropdownOptions = [];
  if(type === "int-dropdown") {
    // TODO: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
    let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
    dropdownOptions = Object.entries(dropdownValues || {}).map(([optValue, optContents]) => (
      <option value={optValue}>{optContents}</option>
    ));
    dropdownOptions.unshift(<option value="" disabled></option>);
  }
  const doInputRecord = (type === "int-dropdown" && propInfo.dropdown === 'keybinds');

  switch (type) {
    case "int":
      inputElem = <input style={{width: "calc(18vw - 8px)"}}
        type="number"
        value={saveDataValue ?? ''} // the '' is to keep the input "controlled" in React, in case saveDataValue isn't provided (null or undefined)
        onChange={e => handleValueUpdate(e.target.value)}
      />;
      break;
      
    case "bool":
      inputElem = <div style={{display: "inline-block", width: "18vw"}}>
        <input
          type="checkbox"
          // className="switch"
          className={`switch switch-lg${(saveDataValue === null || saveDataValue === undefined || '') && ' unset'}`}
          checked={saveDataValue !== '0' && Boolean(saveDataValue)}
          onChange={e => handleValueUpdate(e.target.checked)}
        />
      </div>;
      break;

    case "int-dropdown":
      if(doInputRecord) {
        // const unityCodeCallback = (ucode) => handleValueUpdate(ucode);
        const unityCodeCallback = handleValueUpdate;

        inputElem = <div style={{width: "18vw", display: "inline-block"}}>
          <input
            type="text"
            placeholder="Record input"
            title="Press any key or mouse click in this box to record its input ID. To exit, click out of this box."
            onContextMenu={stopEvent}
            onKeyDown={e => handleKeyDown(e, unityCodeCallback)}
            onMouseUp={e => handleMouseUp(e, unityCodeCallback)}
            style={{width: "calc(50% - 8px)"}} // TODO: move these inlined styles out!
          />
          <select style={{width: "50%"}}
            onChange={e => handleValueUpdate(e.target.value)}
            value={saveDataValue || ''}
          >
            {dropdownOptions}
          </select>
        </div>;
      } else {
        inputElem = <div style={{width: "18vw", display: "inline-block"}}>
          <select style={{width: "100%"}}
            onChange={e => handleValueUpdate(e.target.value)}
            value={saveDataValue || ''}
          >
            {dropdownOptions}
          </select>
        </div>;
      }
      break;
    
    case "float-range":
      inputElem = <input style={{width: "18vw", margin: 0}}
        type="range"
        value={saveDataValue ?? ''}
        onChange={e => handleValueUpdate(e.target.value)}
        min={propInfo.min || 0}
        max={propInfo.max || 1}
        step={propInfo.step || 0.01}
      />;
      break;

    case "color":
      inputElem = <div style={{display: "inline-block", width: "18vw"}}>
        <input style={{width: "5em"}}
          type="color"
          value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
                  : saveDataValue.match(HEX_COL_PATTERN) ? saveDataValue : saveToHex(saveDataValue) || '')}
          onChange={e => handleValueUpdate(e.target.value)}
        />
        <input style={{width: "calc(100% - 5em - 8px"}}
          type="text"
          value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
                  : saveToHex(saveDataValue) || saveDataValue)}
          onChange={e => handleValueUpdate(e.target.value)}
        />
      </div>;
      break;

    case "intlist":
      isList = true;
      inputElem = (
        <ListEditorItems type={type} propInfo={propInfo}
          saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
          version={version}
        >
          {children}
        </ListEditorItems>
      );
      break;
      
    case "string":
    default:
      if(type !== "string") console.error(`Rich value editor: Unexpected type "${type}"; treating as string.`);
      inputElem = <input style={{width: "18vw"}}
        type="text"
        value={saveDataValue ?? ''} // the '' is to keep the input "controlled" in React, in case saveDataValue isn't provided (null or undefined)
        onChange={e => handleValueUpdate(e.target.value)}
      />;
      break;
  }
  // if(!inputElem) inputElem = <></>;
  return ( isList
    ? inputElem
    : <>
      {inputElem || <></>}
      {children}
    </>
  );
}


function saveValStrToList(/**@type {string|null|undefined}*/saveDataStr) {
  if(saveDataStr === null || typeof(saveDataStr) === "undefined") {
    return saveDataStr;
  } else {
    return saveDataStr.split(listDelim);
  }
}
function saveValListToStr(/**@type {any[]|null|undefined}*/saveDataStrAsList) {
  return saveDataStrAsList?.join(listDelim);
}

// let listEditorIdCtr = 0;

function ListEditorItems({ children, type, propInfo, saveDataValue, handleValueUpdate, version }) {
  console.log("ListEditorItems created");
  console.log("ListEditorItems saveDataValue", saveDataValue);
  const defaultNewValue = String(propInfo.default ?? '');

  let itemDropdownOptions;
  // TODO: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
  let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
  if(typeof(dropdownValues) === "object") {
    itemDropdownOptions = Object.entries(dropdownValues).map(([optValue, optContents]) => (
      <option value={optValue}>{optContents}</option>
    ));
    itemDropdownOptions.unshift(<option value="" disabled></option>);
  }

  // const initialItems = (
  // // const calcInitialItems = (saveDataValue) => {
  // //   console.log('calcInitialItems');
  // //   return (
  //     typeof(saveDataValue)==="string" ? saveDataValue.split(listDelim)
  //     : (saveDataValue && Array.isArray(saveDataValue)) ? saveDataValue
  //     : []
  //   ).map(
  //     (v) => ({ id: listEditorIdCtr++, value: v })
  //   );
  // // }
  // const [items, setItems] = useState(initialItems);
  // const [items, setItems] = useState(calcInitialItems(saveDataValue));
  // const items = useMemo(() => calcInitialItems(saveDataValue), [saveDataValue]);

  // function setItems(i) {items = i}
  // function setItems(i) {} // TODO REMOVE THIS as state is being passed in via saveDataValue instead

  // function setItemsAndUpdate(items) {
  //   // setItems(items);
  //   handleValueUpdate(items.map(item => item.value)
  //                 // .filter(v => v!=="" && v!==null && typeof(v)!=="undefined")
  //                 .join(' '));
  // }

  function handleAddItem(newValue) {
    // setItemsAndUpdate([
    //   ...items,
    //   { id: listEditorIdCtr++, value: newValue }
    // ]);
    handleValueUpdate(saveDataValue===null || typeof(saveDataValue)==="undefined"
                      ? newValue // replacing the nullish previous value with a single newValue
                      : saveDataValue + listDelim + newValue);
  }

  // function handleDeleteItem(itemId) {
  function handleDeleteItem(ind) {
    // setItemsAndUpdate(items.filter((item) => item.id !== itemId));
    let asArr = saveValStrToList(saveDataValue);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    handleValueUpdate(saveValListToStr(asArr.filter((v, i) => i !== ind)));
  }

  // function handleUpdateItem(itemId, newValue) {
  function handleUpdateItem(ind, newValue) {
    // setItemsAndUpdate(items.map((item) => (item.id === itemId ? { id: item.id, value: newValue } : item)));
    let asArr = saveValStrToList(saveDataValue);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    asArr[ind] = newValue;
    handleValueUpdate(saveValListToStr(asArr));
  }

  return <div style={{display: "inline-grid"}}>
    {/* <span>id ctr {listEditorIdCtr}</span> */}
    {/* {items.map(item => (
      <div key={item.id} style={{display: "inline-block"}}>
        <input
          type="text"
          value={item.value}
          onChange={e => handleUpdateItem(item.id, e.target.value)}
        />
        <button type="button" title="Remove item" onClick={e => handleDeleteItem(item.id)}>
          &mdash;
        </button>
      </div>
    ))} */}
    {
    // saveDataValue
    saveValStrToList(saveDataValue)
    // ?.split(' ')
    // .map(substr => String(substr ?? ''))
    // ?.map((substr, ind) => {
    ?.map((substr, ind) => {
      //substr = String(substr ?? '');
      let inputElem;
      if(itemDropdownOptions) {
        inputElem = <div style={{width: "18vw", display: "inline-block"}}>
          <select style={{width: "100%"}}
            onChange={e => handleUpdateItem(ind, e.target.value)}
            value={substr}
          >
            {itemDropdownOptions}
          </select>
        </div>;
      } else {
        inputElem = <input
          type="text"
          value={substr}
          onChange={e => handleUpdateItem(ind, e.target.value)}
        />;
      }
      return (
        <div key={ind} style={{display: "inline-block"}}>
          {inputElem}
          <button type="button" title="Remove item" onClick={e => handleDeleteItem(ind)}>
            &mdash;
          </button>
        </div>
      );
    })}
    <div style={{display: "inline-block"}}>
      <button type="button" title="Add item" onClick={e => handleAddItem(defaultNewValue)}>
        +
      </button>
      {children}
    </div>
  </div>;
}
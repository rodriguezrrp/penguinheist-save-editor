import { getKeyParts, keyStrMakeHtmlSafe, partsToHtmlSafeKey, partsToKey } from "../../utils/keyUtils";
import { useStore } from "../../context/SaveDataContext";
import { useVersion } from "../../context/VersionContext";
import { HEX_COL_PATTERN, isEmptyOrNullOrUndefined, saveDataValueValidate, saveToHex } from "../../utils/validUtils";
import { getPropInfo, resolveDropdownFromPropInfo, resolvePropInfoName } from "../../data";
import { listDelim } from "../../utils/saveFileEncodingUtils.mjs";
import { handleKeyDown, handleMouseUp } from "../../utils/unityMapping";
import stopEvent from "../../utils/stopEvent";

export function Editor({ categoryId, fullKey }) {
  const [keyBase, keyExtra] = getKeyParts(fullKey);
  console.log(`Editor created "${keyBase}" "${keyExtra}"`);

  const htmlSafeKey = partsToHtmlSafeKey(keyBase, keyExtra);

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
  
  // const validity = useState(/**@type {boolean | null}*/null);
  // const warning = useState(/**@type {string | null}*/null);  // Note: may expand warnings into its own store? or incorporate warnings into value store?
  
  const { validity, warning } = _initialValidityResult;

  // setValidity(_initialValidityResult.validity);
  // setWarning(_initialValidityResult.warning);

  // Note: may cache this later with useCallback(...) (or useMemo(...)?) for optimization
  const handleValueUpdate = (editorsValue) => {
    const result = saveDataValueValidate(editorsValue, keyBase, keyExtra, version);
    const validatedValue = result.value;
    // setValidity(result.validity);
    // setWarning(result.warning);
    setSaveData(categoryId, fullKey, validatedValue);
  };

  const eraseBtn = <PropEraseButton saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate} />;

  const rawEditor = <PropRawTextInput saveDataValue={saveDataValue} />;
  
  return (
    <div id={'editorRow-'+htmlSafeKey} className="editor-row">
      <SinglePropName propName={propName} fullKey={fullKey} note={propInfo.note} />
      
      <ValidationIndicator validity={validity} warning={warning} />

      <div className="editor-items-container">
        <RichSingleValueEditor type={propInfo.type} propInfo={propInfo} version={version}
          saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
        >
          {eraseBtn}
          {rawEditor}
        </RichSingleValueEditor>

        <div className="prop-type">
          <span className="prop-type"> {propInfo.type}</span>
        </div>
      </div>
    </div>
  );
}

function SinglePropName({ propName, fullKey, note }) {
  // console.log('SinglePropName created');
  return (
    <div className="propname-container">
      <span className="propname">{propName}</span>
      {note && <span className="propname-note" title={note}>
        &nbsp;
        <svg className="icon propname-icon"
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
        </svg>
      </span>}
      <div className="propname-fullkey">
        <span>@{fullKey}@</span>
      </div>
    </div>
  );
}

function ValidationIndicator({ /**@type {boolean | null}*/ validity, /**@type {string | null}*/ warning }) {
  // console.log('ValidationIndicator created');
  return (
    <span className={"validation-ind"+(validity===null?" unused":validity?" accepted":" warning")}
      title={warning}
    >
      {validity===null?'∅':validity?'✔':'✘'}
    </span>
  );
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
      inputElem = <input
        type="number"
        className="w-100"
        value={saveDataValue ?? ''} // the '' is to keep the input "controlled" in React, in case saveDataValue isn't provided (null or undefined)
        onChange={e => handleValueUpdate(e.target.value)}
      />;
      break;
      
    case "bool":
      inputElem = <BooleanEditor saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate} />;
      break;

    case "int-dropdown":
      if(doInputRecord) {
        // const unityCodeCallback = (ucode) => handleValueUpdate(ucode);
        const unityCodeCallback = handleValueUpdate;

        inputElem = 
        <>
        {/* <div style={{width: "18vw", display: "inline-block"}}> */}
          <input
            type="text"
            placeholder="Record input"
            title="Press any key or mouse click in this box to record its input ID. To exit, click out of this box."
            onContextMenu={stopEvent}
            onKeyDown={e => handleKeyDown(e, unityCodeCallback)}
            onMouseUp={e => handleMouseUp(e, unityCodeCallback)}
            className="w-50"
          />
          <SelectEditor saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
            dropdownOptions={dropdownOptions} className={"w-50"}
          />
        {/* </div> */}
        </>
        ;
      } else {
        inputElem = 
        // <div style={{width: "18vw", display: "inline-block"}}>
          <SelectEditor saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
            dropdownOptions={dropdownOptions} className={"w-100"}
          />
        // </div>;
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
      inputElem = <ColorEditor saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate} />;
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
      inputElem = <input
        type="text"
        className="w-100"
        value={saveDataValue ?? ''} // the '' is to keep the input "controlled" in React, in case saveDataValue isn't provided (null or undefined)
        onChange={e => handleValueUpdate(e.target.value)}
      />;
      break;
  }
  // if(!inputElem) inputElem = <></>;
  return ( isList
    ? inputElem
    : <>
      <div className="rich-editor-row">
        {inputElem || <></>}
      </div>
      {/* <div className="raw-editor-and-eraser-row"> */}
        {children}
      {/* </div> */}
    </>
  );
}

function BooleanEditor({ saveDataValue, handleValueUpdate, className="w-100", inputId=undefined }) {
  return <div style={{display: "inline-block"}} className={className}>
    <input
      id={inputId}
      type="checkbox"
      // className="switch"
      className={`switch switch-lg${(saveDataValue === null || saveDataValue === undefined || '') && ' unset'}`}
      checked={saveDataValue !== '0' && Boolean(saveDataValue)}
      onChange={e => handleValueUpdate(e.target.checked)}
    />
  </div>;
}

function ColorEditor({ saveDataValue, handleValueUpdate }) {
  return <>
  {/* <div style={{display: "inline-block", width: "18vw"}}> */}
    <input style={{width: "5em", height: "auto"}}
      type="color"
      value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
              : saveDataValue.match(HEX_COL_PATTERN) ? saveDataValue : saveToHex(saveDataValue) || '')}
      onChange={e => handleValueUpdate(e.target.value)}
    />
    <input style={{width: "calc(100% - 5em)"}}
      type="text"
      value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
              : saveToHex(saveDataValue) || saveDataValue)}
      onChange={e => handleValueUpdate(e.target.value)}
    />
  {/* </div> */}
  </>;
}

function SelectEditor({ saveDataValue, handleValueUpdate, dropdownOptions, className = "" }) {
  return <select
    className={className}
    onChange={e => handleValueUpdate(e.target.value)}
    value={saveDataValue || ''}
  >
    {dropdownOptions}
  </select>;
}

function PropEraseButton({ saveDataValue, handleValueUpdate }) {
  return <button type="button"
    className="editor-erase-button"
    disabled={isEmptyOrNullOrUndefined(saveDataValue)}
    onClick={e => handleValueUpdate(undefined)}
    title="Erase property's value"
  >
    X
  </button>;
}
function PropRawTextInput({ saveDataValue }) {
  return <input
    type="text"
    className="raw-editor"
    disabled
    readOnly={true}
    value={saveDataValue ?? ''} /* the '' is to keep the input "controlled" in React in case saveDataValue isn't provided */
    placeholder="No value"
    title="Raw value in save file"
  />;
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

function ListEditorItems({ children, type, propInfo, saveDataValue, handleValueUpdate, version }) {
  console.log("ListEditorItems created");
  console.log("ListEditorItems saveDataValue", saveDataValue);
  const defaultNewValue = String(propInfo.default ?? '');

  let itemDropdownOptions;
  // TODO: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
  // let dropdownValues;
  let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
  if(typeof(dropdownValues) === "object") {
    itemDropdownOptions = Object.entries(dropdownValues).map(([optValue, optContents]) => (
      <option value={optValue}>{optContents}</option>
    ));
    itemDropdownOptions.unshift(<option value="" disabled></option>);
  }

  function handleAddItem(newValue) {
    handleValueUpdate(saveDataValue===null || typeof(saveDataValue)==="undefined"
                      ? newValue // replacing the nullish previous value with a single newValue
                      : saveDataValue + listDelim + newValue);
  }

  function handleDeleteItem(ind) {
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

  function handleUpdateItem(ind, newValue) {
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

  return (
    <div className="list-editor-grid">
      {
      saveValStrToList(saveDataValue)
      ?.map((substr, ind) => {
        let inputElem;
        if(itemDropdownOptions) {
          // inputElem = <select
          //   onChange={e => handleUpdateItem(ind, e.target.value)}
          //   value={dropdownValues?.hasOwnProperty(substr) && substr || ''}
          // >
          //   {itemDropdownOptions}
          // </select>;
          inputElem = <SelectEditor
            saveDataValue={dropdownValues?.hasOwnProperty(substr) && substr}
            handleValueUpdate={val => handleUpdateItem(ind, val)}
            dropdownOptions={itemDropdownOptions}
          />;
        } else {
          inputElem = <input
            type="text"
            value={substr}
            onChange={e => handleUpdateItem(ind, e.target.value)}
          />;
        }
        return (
          <div key={ind} className="list-editor-grid-row">
            {inputElem}
            <button type="button" title="Remove item" onClick={e => handleDeleteItem(ind)}>
              &mdash;
            </button>
          </div>
        );
      })}
      <div className="list-editor-grid-row">
        <button type="button" title="Add item" onClick={e => handleAddItem(defaultNewValue)}>
          +
        </button>
        {children}
      </div>
    </div>
  );
}



export const relatedKeyBasesForItems = [
  'itemAvailable',
  'itemOwned',
  'newBlueprint',
  'decipheredHint',
];
export const relatedNamingMapForItems = {
  'itemAvailable': 'Available',
  'itemOwned': 'Owned',
  'newBlueprint': 'Blueprint',
  'decipheredHint': 'Hint',
}
export const propInfoFullKeyForItems = '_specialgroup_item';

export function ItemSpecialEditor({ categoryId, fullKeysArray }) {
  console.log('ItemSpecialEditor created ', fullKeysArray);
  // return <div style={{border:'1px steelblue solid'}}>{fullKeysArray.map(k=><div key={k}>{k}</div>)}</div>;
  const commonKeyExtra = getKeyParts(fullKeysArray[0])[1]; // get keyExtra

  const groupPropInfo = getPropInfo(propInfoFullKeyForItems);
  const groupName = resolvePropInfoName(groupPropInfo, commonKeyExtra);

  let contents = relatedKeyBasesForItems.map(keyBase =>
    <ItemSpecialEditorInnerSingleSwitch key={keyBase}
      categoryId={categoryId} keyBase={keyBase} commonKeyExtra={commonKeyExtra}
    />
  );

  return <div id={'editorRow-itemSpecial-'+commonKeyExtra} className="editor-row">
    <MultiPropName
      groupName={groupName}
      note={groupPropInfo.note}
      keyBasesArray={relatedKeyBasesForItems}
      commonKeyExtra={commonKeyExtra}
    />
    <div className="editor-items-container">
      {contents}
    </div>
  </div>;
}

function ItemSpecialEditorInnerSingleSwitch({ categoryId, keyBase, commonKeyExtra }) {
  // Note that no validity is being saved or indicated.
  // As part of a special editor, plus simply being a boolean, validity indication is intentionally ignored.
  
  const fullKey = partsToKey(keyBase, commonKeyExtra);
  const switchId = 'specialEditor-'+keyStrMakeHtmlSafe(fullKey);

  const [saveDataValue, setSaveData] = useStore((store) => {return store[categoryId][fullKey]});

  const version = useVersion();

  // Note: may cache this later with useCallback(...) (or useMemo(...)?) for optimization
  const handleValueUpdate = (editorsValue) => {
    const result = saveDataValueValidate(editorsValue, keyBase, commonKeyExtra, version);
    const validatedValue = result.value;
    // setValidity(result.validity);
    // setWarning(result.warning);
    setSaveData(categoryId, fullKey, validatedValue);
  };

  return <div style={{flex: '1 0 auto', display: 'grid', gap: 'var(--editor-row-padding-x) var(--flex-gap)',
    gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto', gridTemplateAreas: '"header header" "switch eraser"'}}
  >
    <div style={{gridArea: 'header'}}>
      <label htmlFor={switchId}>{relatedNamingMapForItems[keyBase]}</label>
    </div>
    <div style={{gridArea: 'switch'}}>
      <BooleanEditor saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
        inputId={switchId} className="" />
    </div>
    <div style={{gridArea: 'eraser'}}>
      <PropEraseButton saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate} />
    </div>
  </div>;
}

function MultiPropName({ groupName, keyBasesArray, commonKeyExtra, note }) {
  // console.log('MultiPropName created');
  return (
    <div className="propname-container">
      <span className="propname">{groupName}</span>
      {note && <span className="propname-note" title={note}>
        &nbsp;
        <svg className="icon propname-icon"
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
        </svg>
      </span>}
      <div className="propname-fullkey">
        {keyBasesArray.map(keyBase =>
          <div>
            <span key={keyBase}>@{partsToKey(keyBase, commonKeyExtra)}@</span>
          </div>
        )}
      </div>
    </div>
  );
}
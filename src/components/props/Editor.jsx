import { getKeyParts, keyStrMakeHtmlSafe, partsToHtmlSafeKey, partsToKey } from "../../utils/keyUtils";
import { useStore, useStoreGetAll } from "../../context/SaveDataContext";
import { useVersion } from "../../context/VersionContext";
import { HEX_COL_PATTERN, getMaxOutfitSize, isEmptyOrNullOrUndefined, saveDataValueAdjustUsingPropInfo, saveDataValueValidate, saveToHex, saveValListToStr, saveValStrToList } from "../../utils/validUtils";
import { getPropInfo, resolveDropdownFromPropInfo, resolvePropInfoName } from "../../data";
import { listDelim } from "../../utils/saveFileEncodingUtils.mjs";
import { handleKeyDown, handleMouseUp } from "../../utils/unityMapping";
import stopEvent from "../../utils/stopEvent";
import { useState } from "react";

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
      
      <SingleValidationIndicator validity={validity} warning={warning} />

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

function warningMsgWithKey(fullKey, warning) {
  return fullKey + ':\n' + warning;
}
function warningMsgForMultipleValidities(validities) {
  return validities.filter(([fullKey, valInfo]) => valInfo.warning)
    .map(([fullKey, valInfo]) => warningMsgWithKey(fullKey, valInfo.warning))
    .join('\n');
}

function ValidationIndicator({ /**@type {boolean | null}*/ validity, /**@type {string | null}*/ warning,
  /**@type {{fullKey: {validity: boolean | null, warning: string | null}}}*/ otherIndsValidity }) {
  // console.log('ValidationIndicator created');
  
  if(otherIndsValidity) {
    const areErrored = Object.entries(otherIndsValidity).filter(([fullKey, valInfo]) => valInfo.validity !== null && !valInfo.validity);
    const areValid = Object.entries(otherIndsValidity).filter(([fullKey, valInfo]) => valInfo.validity !== null && valInfo.validity);
    // combined overall validity indication and overall warning messages
    validity = areErrored.length ? false : areValid.length ? true : null;
    warning = warningMsgForMultipleValidities(Object.entries(otherIndsValidity));
  }
  const others = otherIndsValidity && <div className="validation-others-container"
      style={{'--valid-inds-ct': Object.keys(otherIndsValidity).length}}
    >
      {Object.entries(otherIndsValidity).map(([fullKey, {validity, warning}]) => {
        // let validity = v === 1 ? null : v === 2;
        return <SingleValidationIndicator validity={validity} warning={warning && warningMsgWithKey(fullKey, warning)} />
      })}
    </div>;
  
  return <div className="validation-inds-container">
    <SingleValidationIndicator validity={validity} warning={warning} />
    {others}
  </div>;
}

const unusedValidityMessage = 'Ignored by selected version'

function SingleValidationIndicator({ /**@type {boolean | null}*/ validity, /**@type {string | null}*/ warning }) {
  const message = warning ? warning : validity === null ? unusedValidityMessage : undefined;
  return <span className={"validation-ind"+(validity===null?" unused":validity?" accepted":" warning")}
    title={message}
  >
    {validity===null?'∅':validity?'✔':'✘'}
  </span>;
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

    case "colorlist":
      isList = true;
      inputElem = (
        <LimitableRetainingListEditor type={type} propInfo={propInfo}
          saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
          version={version} fixedCount={getMaxOutfitSize(version)}
        >
          {children}
        </LimitableRetainingListEditor>
      );
      break;

    case "outfitindices":
      isList = true;
      inputElem = (
        <LimitableRetainingListEditor type={type} propInfo={propInfo}
          saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
          version={version} fixedCount={getMaxOutfitSize(version)}
        >
          {children}
        </LimitableRetainingListEditor>
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

function ColorEditor({ saveDataValue, handleValueUpdate, disabled=false }) {
  return <>
  {/* <div style={{display: "inline-block", width: "18vw"}}> */}
    <input style={{width: "5em", height: "auto"}}
      type="color"
      value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
              : saveDataValue.match(HEX_COL_PATTERN) ? saveDataValue : saveToHex(saveDataValue) || '')}
      onChange={e => handleValueUpdate(e.target.value)}
      disabled={disabled}
    />
    <input style={{width: "calc(100% - 5em)"}}
      type="text"
      value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
              : saveToHex(saveDataValue) || saveDataValue)}
      onChange={e => handleValueUpdate(e.target.value)}
      disabled={disabled}
    />
  {/* </div> */}
  </>;
}

function SelectEditor({ saveDataValue, handleValueUpdate, dropdownOptions, className="", disabled=false }) {
  return <select
    className={className}
    onChange={e => handleValueUpdate(e.target.value)}
    value={saveDataValue || ''}
    disabled={disabled}
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

function LimitableRetainingListEditor({ children, type, propInfo, saveDataValue, handleValueUpdate, version, fixedCount=0, disableInputsWhenUnset=true }) {
  console.log("ListEditorFixableSize created");
  console.log("ListEditorFixableSize saveDataValue", saveDataValue);
  const defaultNewValue = String(propInfo.default ?? '');
  
  const allowAddAndRemove = !(fixedCount && fixedCount > 0);
  
  const defaultRetainedValue = allowAddAndRemove ? null : saveValListToStr(Array.from({length: fixedCount}, (v) => defaultNewValue));

  // Retain the previous saveDataValue when the current one becomes null or undefined
  //  and use this state as an intermediary for the actual editor elements.
  //  This is to allow retaining and possible editing of the property value while it is not in the main save data state.
  // const [retainedSaveDataValue, setRetainedSaveDataValue] = useState(null);
  const [retainedSaveDataValue, setRetainedSaveDataValue] = useState(defaultRetainedValue);
  if(saveDataValue && saveDataValue !== retainedSaveDataValue) {
    // new truthy value came in, sync it up (and 'retain' it)
    console.log('syncing retained from', retainedSaveDataValue, 'to', saveDataValue);
    setRetainedSaveDataValue(saveDataValue); // TODO efficiency check: will this cause one rerender (see if-condition) or none?
  }

  function updateSaveDataValue(newValue) {
    const validatedValue = saveDataValueAdjustUsingPropInfo(newValue, propInfo, version);
    setRetainedSaveDataValue(validatedValue);

    if(saveDataValue) {
      // this call may (depending on implementation) trigger a new re-render as well, via saveDataValue changing
      handleValueUpdate(newValue);
    } else {
    }
  }

  let propInfoDd1 = (type !== "outfitindices") ? propInfo : {...propInfo, type: "int-dropdown"};
  let propInfoDd2 = (type !== "outfitindices") ? null : {...propInfo, type: "int-dropdown",
    dropdown: propInfo.dropdown2, dropdown_extra: propInfo.dropdown2_extra};

  let dropdownOptions;
  // TODO optimization idea: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
  let dropdownValues = resolveDropdownFromPropInfo(propInfoDd1, version);
  if(typeof(dropdownValues) === "object") {
    dropdownOptions = Object.entries(dropdownValues).map(([optValue, optContents]) => (
      <option value={optValue}>{optContents}</option>
    ));
    dropdownOptions.unshift(<option value="" disabled></option>);
  }
  
  let dropdownClothesValues, clothesDropdownOptions;
  let dropdownSkinsValues, skinsDropdownOptions;
  if(type === "outfitindices") {
    dropdownClothesValues = dropdownValues; dropdownValues = undefined;
    clothesDropdownOptions = dropdownOptions; dropdownOptions = undefined;
    // TODO optimization idea: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
    dropdownSkinsValues = resolveDropdownFromPropInfo(propInfoDd2, version);
    if(typeof(dropdownSkinsValues) === "object") {
      skinsDropdownOptions = Object.entries(dropdownSkinsValues).map(([optValue, optContents]) => (
        <option value={optValue}>{optContents}</option>
      ));
      skinsDropdownOptions.unshift(<option value="" disabled></option>);
    }
  }

  function handleAddItem(newValue) {
    updateSaveDataValue(retainedSaveDataValue===null || typeof(retainedSaveDataValue)==="undefined"
                      ? newValue // replacing the nullish previous value with a single newValue
                      : retainedSaveDataValue + listDelim + newValue);
  }

  function handleDeleteItem(ind) {
    let asArr = saveValStrToList(retainedSaveDataValue);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    updateSaveDataValue(saveValListToStr(asArr.filter((v, i) => i !== ind)));
  }

  function handleUpdateItem(ind, newValue) {
    let asArr = saveValStrToList(retainedSaveDataValue);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    asArr[ind] = newValue;
    updateSaveDataValue(saveValListToStr(asArr));
  }

  return (
    <div className="list-editor-grid">
      {
      // saveValStrToList(saveDataValue)
      saveValStrToList(retainedSaveDataValue)
      ?.map((substr, ind) => {

        let inputElem;
        if(dropdownOptions) {
          inputElem = <SelectEditor
            saveDataValue={dropdownValues?.hasOwnProperty(substr) && substr}
            handleValueUpdate={val => handleUpdateItem(ind, val)}
            dropdownOptions={dropdownOptions}
            disabled={Boolean(disableInputsWhenUnset && !saveDataValue)}
          />;
        } else {
          if(type === "colorlist") {
            inputElem = <ColorEditor
              saveDataValue={substr}
              handleValueUpdate={val => handleUpdateItem(ind, val)}
              disabled={Boolean(disableInputsWhenUnset && !saveDataValue)}
            />
          } else if(type === "outfitindices") {
            // Do skins last.
            const _doSkins = ind === getMaxOutfitSize(version);
            let _ddvals = _doSkins ? dropdownSkinsValues : dropdownClothesValues;
            let _ddopts = _doSkins ? skinsDropdownOptions : clothesDropdownOptions;
            let _selectEditor = <SelectEditor
              saveDataValue={_ddvals?.hasOwnProperty(substr) && substr}
              handleValueUpdate={val => handleUpdateItem(ind, val)}
              dropdownOptions={_ddopts}
              disabled={Boolean(disableInputsWhenUnset && !saveDataValue)}
            />;
            if(_doSkins) {
              inputElem = <>
                <span>Skin:</span>
                {/* <SelectEditor
                  saveDataValue={dropdownSkinsValues?.hasOwnProperty(substr) && substr}
                  handleValueUpdate={val => handleUpdateItem(ind, val)}
                  dropdownOptions={skinsDropdownOptions}
                  disabled={Boolean(disableInputsWhenUnset && !saveDataValue)}
                />; */}
                {_selectEditor}
              </>
            } else {
              // inputElem = <SelectEditor
              //   saveDataValue={dropdownClothesValues?.hasOwnProperty(substr) && substr}
              //   handleValueUpdate={val => handleUpdateItem(ind, val)}
              //   dropdownOptions={clothesDropdownOptions}
              //   disabled={Boolean(disableInputsWhenUnset && !saveDataValue)}
              // />;
              inputElem = _selectEditor;
            }
          } else {
            inputElem = <input
              type="text"
              value={substr}
              onChange={e => handleUpdateItem(ind, e.target.value)}
              disabled={Boolean(disableInputsWhenUnset && !saveDataValue)}
            />;
          }
        }
        return (
          <div key={ind} className="list-editor-grid-row">
            {inputElem}
            {allowAddAndRemove &&
              <button type="button" title="Remove item" onClick={e => handleDeleteItem(ind)}>
                &mdash;
              </button>
            }
          </div>
        );

      })}
      <div className="list-editor-grid-row">
        {allowAddAndRemove
        ?
          <button type="button" title="Add item" onClick={e => handleAddItem(defaultNewValue)}>
            +
          </button>
        :
          // with no add or remove, use a nice boolean editor to serve as a toggle of the entire list
          <BooleanEditor
            saveDataValue={saveDataValue ? '1' : undefined}
            className=""
            handleValueUpdate={
              // if it's unchecking (false), unset it (undefined) instead.
              checked => {
                // toggle the editor's retained value being transferred/synced to the main save data state.
                // notice the direct call to handleValueUpdate, not the intermediate handleUpdateItem. This keeps the retained value.
                if(checked) {
                  handleValueUpdate(retainedSaveDataValue);
                } else {
                  handleValueUpdate(undefined);
                }
              }
            }
          />
        }
        {children}
      </div>
      {/* debug: show current main save data state's value, and the current retained value */}
      {/* <div className="list-editor-grid-row">debug {disableInputsWhenUnset&&'d '}<span>({''+saveDataValue})</span> <span>r({''+retainedSaveDataValue})</span></div> */}
    </div>
  );
}



export const propInfoFullKeyForItems = '_specialgroup_item';
export const propInfoForItems = getPropInfo(propInfoFullKeyForItems);
export const relatedKeyBasesForItems = Object.keys(propInfoForItems.keybasesmap);
export const relatedNamingMapForItems = propInfoForItems.keybasesmap;

export function ItemSpecialEditor({ categoryId, fullKeysArray }) {
  console.log('ItemSpecialEditor created ', fullKeysArray);
  // return <div style={{border:'1px steelblue solid'}}>{fullKeysArray.map(k=><div key={k}>{k}</div>)}</div>;
  const commonKeyExtra = getKeyParts(fullKeysArray[0])[1]; // get keyExtra

  const groupPropInfo = propInfoForItems;
  const groupName = resolvePropInfoName(groupPropInfo, commonKeyExtra);

  const version = useVersion();

  // const [saveDataValue, setSaveData] = useStore((store) => {//console.log('key: '+spacedKey+' store:',store);
  //   // return store[spacedKey]});
  //   return store[categoryId][fullKey]}
  // );
  const getAllData = useStoreGetAll();

  const _initialDataOfCategory = getAllData()[categoryId];

  const [keysValidity, setKeysValidity] = useState(
    Object.fromEntries(relatedKeyBasesForItems.map(keyBase => {
      const fullKey = partsToKey(keyBase, commonKeyExtra);
      let _initialValidityResult = saveDataValueValidate(_initialDataOfCategory[fullKey], keyBase, commonKeyExtra, version);
      return [fullKey, {validity: _initialValidityResult.validity, warning: _initialValidityResult.warning}];
    }))
  );
  function setSingleKeyValidity(fullKey, newValidity, newWarning) {
    setKeysValidity({
      ...keysValidity,
      [fullKey]: {validity: newValidity, warning: newWarning}
    });
  }

  let contents = relatedKeyBasesForItems.map(keyBase =>
    <ItemSpecialEditorInnerSingleSwitch key={keyBase}
      categoryId={categoryId} keyBase={keyBase} commonKeyExtra={commonKeyExtra}
      setSingleKeyValidity={setSingleKeyValidity}
    />
  );

  return <div id={'editorRow-itemSpecial-'+commonKeyExtra} className="editor-row">
    <MultiPropName
      groupName={groupName}
      note={groupPropInfo.note}
      keyBasesArray={relatedKeyBasesForItems}
      commonKeyExtra={commonKeyExtra}
    />
    <ValidationIndicator otherIndsValidity={keysValidity} />
    <div className="editor-items-container">
      {contents}
    </div>
  </div>;
}

function ItemSpecialEditorInnerSingleSwitch({ categoryId, keyBase, commonKeyExtra, setSingleKeyValidity }) {
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

  return <div className="switch-grid">
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
import { getKeyParts, keyStrMakeHtmlSafe, partsToHtmlSafeKey, partsToKey } from "../../utils/keyUtils";
import { useStore, useStoreGetAll } from "../../context/SaveDataContext";
import { useVersion } from "../../context/VersionContext";
import { HEX_COL_PATTERN, getMaxOutfitSize, saveDataValueValidate, saveToHex, saveValListPush, saveValListToStr, saveValStrToList } from "../../utils/validUtils";
import { getPropInfo, resolveDropdownFromPropInfo, resolvePropInfoName } from "../../data";
import { listDelim } from "../../utils/saveFileEncodingUtils.mjs";
import { handleKeyDown, handleMouseUp } from "../../utils/unityMapping";
import stopEvent from "../../utils/stopEvent";
import { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { Popover } from "react-tiny-popover";
import { dropdownOptionsDataContainsValue, resolveDropdownOptionDataCached } from "./special/dropdownCaching";
import { SelectEditor } from "./special/SelectEditor";
import { useSelectDropdownType } from "../../context/SelectDropdownTypeContext";

export function Editor({ categoryId, fullKey }) {
  const [keyBase, keyExtra] = getKeyParts(fullKey);
  // console.log(`Editor created "${keyBase}" "${keyExtra}"`);

  const htmlSafeKey = partsToHtmlSafeKey(keyBase, keyExtra);

  const [saveDataValue, setSaveData] = useStore((store) => {//console.log('key: '+spacedKey+' store:',store);
                                                            // return store[spacedKey]});
                                                            return store[categoryId][fullKey]});
  // console.log('here right after useStore (Editor). value '+saveDataValue);

  const propInfo = getPropInfo(fullKey);
  
  // const propName = propInfo.name;
  const propName = resolvePropInfoName(propInfo, keyExtra);
  
  const version = useVersion(); // note this is causing a dependency on the version Context; should not be an issue for re-rendering
  
  // TODO Note: can optimize avoiding calling this twice by passing a function to useState directly. Perhaps by wrapping it in useCallback.
  // https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state
  let _initialValidityResult = saveDataValueValidate(saveDataValue, keyBase, keyExtra, version, propInfo.delim);
  
  // const validity = useState(/**@type {boolean | null}*/null);
  // const warning = useState(/**@type {string | null}*/null);  // Note: may expand warnings into its own store? or incorporate warnings into value store?
  
  const { validity, warning } = _initialValidityResult;

  // setValidity(_initialValidityResult.validity);
  // setWarning(_initialValidityResult.warning);

  // Note: may cache this later with useCallback(...) (or useMemo(...)?) for optimization
  const handleValueUpdate = (editorsValue) => {
    const result = saveDataValueValidate(editorsValue, keyBase, keyExtra, version, propInfo.delim);
    const validatedValue = result.value;
    // setValidity(result.validity);
    // setWarning(result.warning);
    setSaveData(categoryId, fullKey, validatedValue);
  };

  // console.log('saveDataValue:', typeof(saveDataValue)==="string" ? `"${saveDataValue}"` : saveDataValue);

  const eraseBtn = <PropEraseButton saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate} />;

  const rawEditor = <PropRawTextInput saveDataValue={saveDataValue} />;
  
  let debugTypeDisplay = null;
  if (process.env.NODE_ENV === 'development') {
    debugTypeDisplay = <div className="prop-type">
      <span className="prop-type"> {propInfo.type}</span>
    </div>;
  }

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

        {debugTypeDisplay}
      </div>
    </div>
  );
}

function SinglePropName({ propName, fullKey, note }) {
  // console.log('SinglePropName created');
  return (
    <div className="propname-container">
      <span className="propname">{propName}</span>
      <PropNameNoteIndicator note={note} />
      <div className="propname-fullkey">
        <span>@{fullKey}@</span>
      </div>
    </div>
  );
}

function PropNameNoteIndicator({ note }) {
  const [isPopoverClickedOpen, setIsPopoverClickedOpen] = useState(false);
  const [isPopoverHoveredOpen, setIsPopoverHoveredOpen] = useState(false);
  return note && (
    <Popover
      isOpen={isPopoverClickedOpen || isPopoverHoveredOpen}
      positions={['top','bottom','right','left']}
      padding={1}
      onClickOutside={() => { setIsPopoverClickedOpen(false); setIsPopoverHoveredOpen(false); }}
      content={
        <div className={"popover" + (isPopoverClickedOpen ? " popover-clicked-open" : "")}>{note}</div>
      }
    >
      <span className="propname-note" title={note}
        onMouseOver={() => setIsPopoverHoveredOpen(true)}
        onMouseOut={() => setIsPopoverHoveredOpen(false)}
        onClick={() => setIsPopoverClickedOpen(!isPopoverClickedOpen)}
      >
        <BsQuestionCircle aria-label={`Note about attribute: ${note}`} className="icon propname-icon" />
      </span>
    </Popover>
  );
}


function warningMsgWithKey(fullKey, warning, keyBasesNamingMap) {
  if(!keyBasesNamingMap)
    return fullKey + ':\n' + warning;
  const [keyBase, ] = getKeyParts(fullKey);
  return keyBasesNamingMap[keyBase] + ':\n' + warning;
}
function warningMsgForMultipleValidities(validities, keyBasesNamingMap) {
  return validities.filter(([fullKey, valInfo]) => valInfo.warning)
    .map(([fullKey, valInfo]) => warningMsgWithKey(fullKey, valInfo.warning, keyBasesNamingMap))
    .join('\n');
}

// function ValidationIndicator({ /**@type {boolean | null}*/ validity, /**@type {string | null}*/ warning,
//   /**@type {{fullKey: {validity: boolean | null, warning: string | null}}}*/ otherIndsValidity }) {
//   // console.log('ValidationIndicator created');
//   if(otherIndsValidity) {
//     return <MultiValidationIndicator validity={validity} warning={warning} otherIndsValidity={otherIndsValidity} />;
//   } else {
//     return <SingleValidationIndicator validity={validity} warning={warning} />;
//   }
// }

function MultiValidationIndicator({ /**@type {{fullKey: {validity: boolean | null, warning: string | null}}}*/ otherIndsValidity,
  /**@type {{[keyBase: string]: string} | null}*/ keyBasesNamingMap }) {
  // console.log('MultiValidationIndicator created');

  // const [isParentHovered, setIsParentHovered] = useState(false);

  const areErrored = Object.entries(otherIndsValidity).filter(([fullKey, valInfo]) => valInfo.validity !== null && !valInfo.validity);
  const areValid = Object.entries(otherIndsValidity).filter(([fullKey, valInfo]) => valInfo.validity !== null && valInfo.validity);
  // combined overall validity indication and overall warning messages
  const overallValidity = areErrored.length ? false : areValid.length ? true : null;
  const overallWarning = warningMsgForMultipleValidities(Object.entries(otherIndsValidity), keyBasesNamingMap);

  return <div className="validation-inds-container">
    <SingleValidationIndicator validity={overallValidity} warning={overallWarning}  />
    <div className="validation-others-container"
      style={{'--valid-inds-ct': Object.keys(otherIndsValidity).length}}
      // onMouseOver={() => setIsParentHovered(true)}
      // onMouseOut={() => setIsParentHovered(false)}
    >
      {Object.entries(otherIndsValidity).map(([fullKey, {validity, warning}]) => {
        return <SingleValidationIndicator
          key={fullKey}
          validity={validity}
          warning={warning && warningMsgWithKey(fullKey, warning, keyBasesNamingMap)}
          // allowPopover={isParentHovered}
        />;
      })}
    </div>
  </div>;
}

const unusedValidityMessage = 'Ignored by selected version'

function SingleValidationIndicator({ /**@type {boolean | null}*/ validity, /**@type {string | null}*/ warning,
  /**@type {boolean}*/ allowPopover = true }) {
  
  const message = warning ? warning : validity === null ? unusedValidityMessage : undefined;
  const [isPopoverClickedOpen, setIsPopoverClickedOpen] = useState(false);
  const [isPopoverHoveredOpen, setIsPopoverHoveredOpen] = useState(false);
  return (
  <Popover
    isOpen={message && allowPopover && (isPopoverClickedOpen || isPopoverHoveredOpen)}
    positions={['top','bottom','right','left']}
    // padding={8}
    onClickOutside={() => { setIsPopoverClickedOpen(false); setIsPopoverHoveredOpen(false); }}
    content={
      <div className={"popover"
        + (isPopoverClickedOpen ? " popover-clicked-open" : "")
        + (validity===null?" unused":validity?" accepted":" warning")
      }>{message}</div>
    }
  >
  <span className={"validation-ind"+(validity===null?" unused":validity?" accepted":" warning")}
    title={message}
    onMouseOver={() => setIsPopoverHoveredOpen(true)}
    onMouseOut={() => setIsPopoverHoveredOpen(false)}
    onClick={() => setIsPopoverClickedOpen(!isPopoverClickedOpen)}
  >
    {validity===null?'∅':validity?'✔':'✘'}
  </span>
  </Popover>
  );
}



function RichSingleValueEditor({ children, type, saveDataValue, handleValueUpdate, propInfo, version }) {
  // console.log(`RichSingleValueEditor created ${type}`);
  let inputElem = null;
  let isComplexInput = false;
  
  let dropdownOptions = [];
  const dropdownType = useSelectDropdownType();  // creates a dependency on SelectDropdownTypeContext
  if(type === "int-dropdown") {
    // TODO: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
    // console.time('resolve dropdown');
    // let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
    // console.timeEnd('resolve dropdown');
    // console.time('prepare dropdownValues');
    // dropdownOptions = (dropdownValues || []).map(([optValue, optContents]) => (
    //   <option value={optValue}>{optContents}</option>
    // ));
    // dropdownOptions.unshift(<option value="" disabled></option>);
    // console.timeEnd('prepare dropdownValues');
    dropdownOptions = resolveDropdownOptionDataCached(propInfo, version, dropdownType);
  }
  const makeInputRecorder = (type === "int-dropdown" && propInfo.dropdown === "keybinds");

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
      if(makeInputRecorder) {
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
            dropdownOptions={dropdownOptions} dropdownType={dropdownType} className={"w-50"}
          />
        {/* </div> */}
        </>
        ;
      } else {
        inputElem = 
        // <div style={{width: "18vw", display: "inline-block"}}>
          <SelectEditor saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
            dropdownOptions={dropdownOptions} dropdownType={dropdownType} className={"w-100"}
          />
        // </div>;
      }
      break;
    
    case "float-range":
      inputElem = <input style={{width: "90%", margin: 0}}
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
      isComplexInput = true;
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
      isComplexInput = true;
      inputElem = (
        <ListEditorSpecial type={type} propInfo={propInfo}
          saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
          version={version} fixedCount={getMaxOutfitSize(version)}
        >
          {children}
        </ListEditorSpecial>
      );
      break;

    case "outfitindices":
      isComplexInput = true;
      inputElem = (
        <ListEditorSpecial type={type} propInfo={propInfo}
          saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
          version={version} fixedCount={getMaxOutfitSize(version)}
        >
          {children}
        </ListEditorSpecial>
      );
      break;

    case "furnituretransform":
      isComplexInput = true;
      inputElem = (
        <FurnitureTransformEditor type={type} propInfo={propInfo}
          saveDataValue={saveDataValue} handleValueUpdate={handleValueUpdate}
          version={version}
        >
          {children}
        </FurnitureTransformEditor>
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
  return ( isComplexInput
    ? inputElem
    : <>
      <div className="rich-editor-row">
        {inputElem || <></>}
      </div>
      {children}
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
    <input
      // style={{width: "5em", height: "auto"}}
      className="for-color-editor"
      type="color"
      value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
              : saveDataValue.match(HEX_COL_PATTERN) ? saveDataValue : saveToHex(saveDataValue) || '')}
      onChange={e => handleValueUpdate(e.target.value)}
      disabled={disabled}
    />
    <input
      // style={{width: "calc(100% - 5em)"}}
      className="for-color-editor"
      type="text"
      value={(typeof(saveDataValue) === "undefined" || saveDataValue === null ? ''
              : saveToHex(saveDataValue) || saveDataValue)}
      onChange={e => handleValueUpdate(e.target.value)}
      disabled={disabled}
    />
  {/* </div> */}
  </>;
}

// function SelectEditor({ saveDataValue, handleValueUpdate, dropdownOptions, className="", disabled=false }) {
//   // console.log('SelectEditor created');
//   // let hasSaveDataValue = typeof(dropdownOptions?.find((v) => String(v.props.value) === String(saveDataValue))) !== "undefined";
//   const _saveDataValueToString = String(saveDataValue);
//   let hasSaveDataValue = dropdownOptions?.some((v) => String(v.props.value) === _saveDataValueToString);
//   // console.log(saveDataValue, _saveDataValueToString, hasSaveDataValue);
//   return <select
//     className={className}
//     onChange={e => {
//       // console.log('pre handleValueUpdate:', saveDataValue, e); console.log('e.target.value:', e.target.value);
//       handleValueUpdate(e.target.value)
//     }}
//     value={hasSaveDataValue ? saveDataValue : ''}
//     disabled={disabled}
//   >
//     {dropdownOptions}
//   </select>;
// }

function PropEraseButton({ saveDataValue, handleValueUpdate }) {
  // Note: does not disable when saveDataValue is an empty string ('')
  return <button type="button"
    className="editor-erase-button"
    disabled={saveDataValue===null || typeof(saveDataValue)==="undefined"}
    onClick={e => handleValueUpdate(undefined)}
    title="Erase property from save"
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



function ListEditorItems({ children, type, propInfo, saveDataValue, handleValueUpdate, version, delim = listDelim }) {
  // console.log("ListEditorItems created");
  // console.log("ListEditorItems saveDataValue", saveDataValue);
  const defaultNewValue = String(propInfo.default ?? '');
  if(propInfo.delim) delim = propInfo.delim;

  const dropdownType = useSelectDropdownType();  // creates a dependency on SelectDropdownTypeContext

  let itemDropdownOptions;
  // TODO: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
  // let dropdownValues;
  // let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
  // // TODO optimization idea: useMemo around the code that generates the dropdownOptions list!
  // if(Array.isArray(dropdownValues)) {
  //   itemDropdownOptions = dropdownValues.map(([optValue, optContents]) => (
  //     <option value={optValue}>{optContents}</option>
  //   ));
  //   itemDropdownOptions.unshift(<option value="" disabled></option>);
  // }
  itemDropdownOptions = resolveDropdownOptionDataCached(propInfo, version, dropdownType);

  function handleAddItem(newValue) {
    handleValueUpdate(saveDataValue===null || typeof(saveDataValue)==="undefined"
                      ? newValue // replacing the nullish previous value with a single newValue
                      : saveValListPush(saveDataValue, newValue, delim));
  }

  function handleDeleteItem(ind) {
    let asArr = saveValStrToList(saveDataValue, delim);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    handleValueUpdate(saveValListToStr(asArr.filter((v, i) => i !== ind), delim));
  }

  function handleUpdateItem(ind, newValue) {
    let asArr = saveValStrToList(saveDataValue, delim);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    asArr[ind] = newValue;
    // console.log(ind, ',', newValue, ',', saveDataValue, ',', asArr);
    handleValueUpdate(saveValListToStr(asArr, delim));
  }

  return (
    <div className="list-editor-grid">
      {
      saveValStrToList(saveDataValue, delim)
      ?.map((substr, ind) => {
        // if(!dropdownOptionsDataContainsValue(itemDropdownOptions, substr)) {
        //   console.log('existence problem:', substr, 'in', itemDropdownOptions,
        //     'was', dropdownOptionsDataContainsValue(itemDropdownOptions, substr)
        //   );
        // }

        let inputElem;
        if(itemDropdownOptions) {
          inputElem = <SelectEditor
            // saveDataValue={dropdownValues?.some(([k,]) => k === substr) && substr}
            saveDataValue={dropdownOptionsDataContainsValue(itemDropdownOptions, substr) && substr}
            handleValueUpdate={val => handleUpdateItem(ind, val)}
            dropdownOptions={itemDropdownOptions} dropdownType={dropdownType}
          />;
        } else {
          inputElem = <input className="w-100"
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



function ListEditorSpecial({ children, type, propInfo, saveDataValue, handleValueUpdate, version,
                                        fixedCount=0, disableInputsWhenUnset=true }) {
  // console.log("ListEditorSpecial created");
  // console.log("ListEditorSpecial saveDataValue", saveDataValue);
  const defaultNewValue = String(propInfo.default ?? '');
  const _defaultSkin = propInfo.default_skin ?? '';
  const delim = listDelim;
  
  const allowAddAndRemove = !(fixedCount && fixedCount > 0);
  
  const defaultFullValueWhenFalsy = allowAddAndRemove ? null : saveValListToStr(
    type === "outfitindices"
      ? Array.from({length: fixedCount + 1}, (v, i) => i === fixedCount ? _defaultSkin : defaultNewValue)
      : Array.from({length: fixedCount}, (v) => defaultNewValue)
  , delim);

  // function updateSaveDataValue(newValue) {
  //   handleValueUpdate(newValue);
  // }
  function toggleSaveDataValue(checked) {
    // Notice the direct call to handleValueUpdate, not the intermediate handleUpdateItem. This keeps the retained value.
    if(checked) {
      handleValueUpdate(defaultFullValueWhenFalsy);
    } else {
      handleValueUpdate(undefined);
    }
  }

  // dropdowns' propInfo
  let propInfoDd1 = (type !== "outfitindices") ? propInfo : {...propInfo, type: "int-dropdown"};
  let propInfoDd2 = (type !== "outfitindices") ? null : {...propInfo, type: "int-dropdown",
    dropdown: propInfo.dropdown2, dropdown_extra: propInfo.dropdown2_extra};

  const dropdownType = useSelectDropdownType();  // creates a dependency on SelectDropdownTypeContext

  let dropdownOptions;
  // TODO optimization idea: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
  // let dropdownValues = resolveDropdownFromPropInfo(propInfoDd1, version);
  // // TODO optimization idea: useMemo around the code that generates the dropdownOptions list!
  // if(Array.isArray(dropdownValues)) {
  //   dropdownOptions = dropdownValues.map(([optValue, optContents]) => (
  //     <option value={optValue}>{optContents}</option>
  //   ));
  //   dropdownOptions.unshift(<option value="" disabled></option>);
  // }
  dropdownOptions = resolveDropdownOptionDataCached(propInfoDd1, version, dropdownType);
  
  // let dropdownClothesValues;
  let clothesDropdownOptions;
  // let dropdownSkinsValues;
  let skinsDropdownOptions;
  if(type === "outfitindices") {
    // dropdownClothesValues = dropdownValues; dropdownValues = undefined;
    clothesDropdownOptions = dropdownOptions; dropdownOptions = undefined;
    // TODO optimization idea: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
    // dropdownSkinsValues = resolveDropdownFromPropInfo(propInfoDd2, version);
    // if(Array.isArray(dropdownSkinsValues)) {
    //   skinsDropdownOptions = dropdownSkinsValues.map(([optValue, optContents]) => (
    //     <option value={optValue}>{optContents}</option>
    //   ));
    //   skinsDropdownOptions.unshift(<option value="" disabled></option>);
    // }
    skinsDropdownOptions = resolveDropdownOptionDataCached(propInfoDd2, version, dropdownType);
  }

  function handleAddItem(newValue) {
    handleValueUpdate(saveDataValue===null || typeof(saveDataValue)==="undefined"
                      ? newValue // replacing the nullish previous value with a single newValue
                      : saveValListPush(saveDataValue, newValue, delim));
  }

  function handleDeleteItem(ind) {
    let asArr = saveValStrToList(saveDataValue, delim);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    handleValueUpdate(saveValListToStr(asArr.filter((v, i) => i !== ind), delim));
  }

  function handleUpdateItem(ind, newValue) {
    let asArr = saveValStrToList(saveDataValue, delim);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle update, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    asArr[ind] = newValue;
    handleValueUpdate(saveValListToStr(asArr, delim));
  }

  return (
    <div className="list-editor-grid">
      {
      // saveValStrToList(saveDataValue)
      saveValStrToList(saveDataValue || defaultFullValueWhenFalsy, delim)
      ?.map((substr, ind) => {

        let inputElem;
        if(dropdownOptions) {
          // console.log(dropdownValues);
          // console.log(substr);
          // console.log(dropdownValues?.some(([k,]) => k === substr));
          inputElem = <SelectEditor
            // saveDataValue={dropdownValues?.some(([k,]) => k === substr) && substr}
            saveDataValue={dropdownOptionsDataContainsValue(dropdownOptions, substr) && substr}
            handleValueUpdate={val => handleUpdateItem(ind, val)}
            dropdownOptions={dropdownOptions} dropdownType={dropdownType}
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
            // let _ddvals = _doSkins ? dropdownSkinsValues : dropdownClothesValues;
            let _ddopts = _doSkins ? skinsDropdownOptions : clothesDropdownOptions;
            let _selectEditor = <SelectEditor
              // saveDataValue={_ddvals?.some(([k,]) => k === substr) && substr}
              saveDataValue={dropdownOptionsDataContainsValue(_ddopts, substr) && substr}
              handleValueUpdate={val => handleUpdateItem(ind, val)}
              dropdownOptions={_ddopts} dropdownType={dropdownType}
              disabled={Boolean(disableInputsWhenUnset && !saveDataValue)}
            />;
            if(_doSkins) {
              inputElem = <>
                <span>Skin:</span>
                {_selectEditor}
              </>
            } else {
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
            // if it's unchecking (false), unset it (undefined) instead.
            saveDataValue={saveDataValue ? '1' : undefined}
            className=""
            handleValueUpdate={
              // if it's unchecking (false), unset it (undefined) instead.
              checked => toggleSaveDataValue(checked)
            }
          />
        }
        {children}
      </div>
      {/* debug: show current main save data state's value, and the current retained value */}
      {/* <div className="list-editor-grid-row">debug {disableInputsWhenUnset&&'d '}{dataUpdateWasFromThis.current&&'s '}
        <span>({''+saveDataValue})</span> <span>r({''+retainedSaveDataValue})</span></div> */}
    </div>
  );
}



const furnitureTransformDelim = ':';
const transformPosOrRotDelim = ',';

function FurnitureTransformEditor({ children, type, propInfo, saveDataValue, handleValueUpdate, version }) {
  // console.log("FurnitureTransformEditor created");
  // console.log("FurnitureTransformEditor saveDataValue", saveDataValue);
  const defaultNewFurnitureValue = String(propInfo.default ?? '');
  const defaultNewPosRotValue = '';
  
  const defaultFullValueWhenFalsy = saveValListToStr([
    defaultNewFurnitureValue,
    saveValListToStr(Array.from({length: 3}, (v) => defaultNewPosRotValue), transformPosOrRotDelim),
    saveValListToStr(Array.from({length: 4}, (v) => defaultNewPosRotValue), transformPosOrRotDelim)
  ], furnitureTransformDelim);

  const dropdownType = useSelectDropdownType();  // creates a dependency on SelectDropdownTypeContext

  let furnitureDropdownOptions;
  // TODO: useMemo on resolveDropdownFromPropInfo, or its resolveDropdown function call inside it?
  // let dropdownValues;
  // let dropdownValues = resolveDropdownFromPropInfo(propInfo, version);
  // // TODO optimization idea: useMemo around the code that generates the dropdownOptions list!
  // if(Array.isArray(dropdownValues)) {
  //   furnitureDropdownOptions = dropdownValues.map(([optValue, optContents]) => (
  //     <option value={optValue}>{optContents}</option>
  //   ));
  //   furnitureDropdownOptions.unshift(<option value="" disabled></option>);
  // }
  furnitureDropdownOptions = resolveDropdownOptionDataCached(propInfo, version, dropdownType);

  // function handleAddItem(newValue) {
  //   handleValueUpdate(saveDataValue===null || typeof(saveDataValue)==="undefined"
  //                     ? newValue // replacing the nullish previous value with a single newValue
  //                     : saveDataValue + furnitureTransformDelim + newValue);
  // }

  function handleDeleteItem(ind) {
    let asArr = saveValStrToList(saveDataValue, furnitureTransformDelim);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle delete, asArr was not an array! Performing NO ACTION.');
      return;
    }
    if(ind >= asArr.length || ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    handleValueUpdate(saveValListToStr(asArr.filter((v, i) => i !== ind), furnitureTransformDelim));
  }

  function handleUpdateItem(ind, newValue) {
    let asArr = saveValStrToList(saveDataValue, furnitureTransformDelim);
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle update, asArr was not an array! Performing NO ACTION.');
      return;
    }
    // if(ind >= asArr.length || ind < 0) {
    if(ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    while(ind >= asArr.length) {
      asArr.push(defaultNewPosRotValue);
    }
    asArr[ind] = newValue;
    handleValueUpdate(saveValListToStr(asArr, furnitureTransformDelim));
  }
  function toggleSaveDataValue(checked) {
    if(checked) {
      handleValueUpdate(saveDataValue || defaultFullValueWhenFalsy);
    } else {
      handleValueUpdate(undefined);
    }
  }

  let saveValAsList = saveValStrToList(saveDataValue, furnitureTransformDelim) ?? [];
  // // ensure its existence and length for the editors, avoiding undefined / out-of-bounds problems
  // if(!saveValAsList)
  //   saveValAsList = [];
  // while(saveValAsList && saveValAsList.length < 3) {
  //   saveValAsList.push('');
  // }

  return (
    <div className="list-editor-grid">
      <div className="list-editor-grid-row furniture-selector">
        <span>Furniture:</span>
        <SelectEditor
          // saveDataValue={dropdownValues?.some(([k,]) => k === saveValAsList[0]) && saveValAsList[0]}
          saveDataValue={dropdownOptionsDataContainsValue(furnitureDropdownOptions, saveValAsList[0]) && saveValAsList[0]}
          handleValueUpdate={val => handleUpdateItem(0, val)}
          dropdownOptions={furnitureDropdownOptions} dropdownType={dropdownType}
        />
        <PropRawTextInput
          saveDataValue={saveValAsList[0]}
        />
      </div>
      <div className="list-editor-grid-row">
        <FurnitureTransformEditorSubgrid
          defaultNewPosRotValue={defaultNewPosRotValue}
          posSaveDataValue={saveValAsList[1]}
          rotSaveDataValue={saveValAsList[2]}
          handlePosValueUpdate={val => handleUpdateItem(1, val)}
          handleRotValueUpdate={val => handleUpdateItem(2, val)}
        />
      </div>
      {saveValAsList && saveValAsList.length > 3 && saveValAsList.slice(3).map((substr, ind) => {
        ind = ind + 3;
        return <div key={ind} className="list-editor-grid-row">
          <input
            type="text"
            value={substr}
            onChange={e => handleUpdateItem(ind, e.target.value)}
          />
          <button type="button" title="Remove item" onClick={e => handleDeleteItem(ind)}>
            &mdash;
          </button>
        </div>;
      })}
      <div className="list-editor-grid-row">
        <BooleanEditor
          // if it's unchecking (false), unset it (undefined) instead.
          saveDataValue={saveDataValue ? '1' : undefined}
          className=""
          handleValueUpdate={
            // if it's unchecking (false), unset it (undefined) instead.
            checked => toggleSaveDataValue(checked)
          }
        />
        {children}
      </div>
    </div>
  );
}

function FurnitureTransformEditorSubgrid({ defaultNewPosRotValue, posSaveDataValue, rotSaveDataValue, handlePosValueUpdate, handleRotValueUpdate }) {
  const posAsList = saveValStrToList(posSaveDataValue, transformPosOrRotDelim) ?? [];
  const rotAsList = saveValStrToList(rotSaveDataValue, transformPosOrRotDelim) ?? [];

  function handleUpdateItem(fullValue, handleUpdateFn, ind, newValue) {
    let asArr = saveValStrToList(fullValue, transformPosOrRotDelim) ?? [];
    if(!Array.isArray(asArr)) {
      console.error('When trying to handle update, asArr was not an array! Performing NO ACTION.');
      return;
    }
    // if(ind >= asArr.length || ind < 0) {
    if(ind < 0) {
      throw new Error(`index ${ind} out of bounds for save value array ${asArr}`);
    }
    while(ind >= asArr.length) {
      asArr.push(defaultNewPosRotValue);
    }
    asArr[ind] = newValue;
    handleUpdateFn(saveValListToStr(asArr, transformPosOrRotDelim));
  }
  function handleUpdatePosItem(ind, newValue) {
    return handleUpdateItem(posSaveDataValue, handlePosValueUpdate, ind, newValue);
  }
  function handleUpdateRotItem(ind, newValue) {
    return handleUpdateItem(rotSaveDataValue, handleRotValueUpdate, ind, newValue);
  }

  return (
    <div className="transform-grid">
      <span style={{gridArea: 'x'}}>x</span>
      <span style={{gridArea: 'y'}}>y</span>
      <span style={{gridArea: 'z'}}>z</span>
      <span style={{gridArea: 'w'}}>w</span>
      
      <input className="transform-axis-label" style={{gridArea: 'px'}}
        type="text"
        value={posAsList[0] || ''}
        onChange={e => handleUpdatePosItem(0, e.target.value)}
      />
      <input className="transform-axis-label" style={{gridArea: 'py'}}
        type="text"
        value={posAsList[1] || ''}
        onChange={e => handleUpdatePosItem(1, e.target.value)}
      />
      <input className="transform-axis-label" style={{gridArea: 'pz'}}
        type="text"
        value={posAsList[2] || ''}
        onChange={e => handleUpdatePosItem(2, e.target.value)}
      />
      
      <input className="transform-axis-label" style={{gridArea: 'rx'}}
        type="text"
        value={rotAsList[0] || ''}
        onChange={e => handleUpdateRotItem(0, e.target.value)}
      />
      <input className="transform-axis-label" style={{gridArea: 'ry'}}
        type="text"
        value={rotAsList[1] || ''}
        onChange={e => handleUpdateRotItem(1, e.target.value)}
      />
      <input className="transform-axis-label" style={{gridArea: 'rz'}}
        type="text"
        value={rotAsList[2] || ''}
        onChange={e => handleUpdateRotItem(2, e.target.value)}
      />
      <input className="transform-axis-label" style={{gridArea: 'rw'}}
        type="text"
        value={rotAsList[3] || ''}
        onChange={e => handleUpdateRotItem(3, e.target.value)}
      />

      <div style={{gridArea: 'pe'}}>
        <span className="transform-part-label">Position</span>
        <PropEraseButton saveDataValue={posSaveDataValue} handleValueUpdate={val => handlePosValueUpdate(val)} />
      </div>
      <div style={{gridArea: 're'}}>
        <span className="transform-part-label">Rotation</span>
        <PropEraseButton saveDataValue={rotSaveDataValue} handleValueUpdate={val => handleRotValueUpdate(val)} />
      </div>
    </div>
  );
}



export const propInfoFullKeyForItems = '_specialgroup_item';
export const propInfoForItems = getPropInfo(propInfoFullKeyForItems);
export const relatedKeyBasesForItems = Object.keys(propInfoForItems.keybasesmap);
export const relatedNamingMapForItems = propInfoForItems.keybasesmap;

export function ItemSpecialEditor({ categoryId, fullKeysArray }) {
  // console.log('ItemSpecialEditor created ', fullKeysArray);
  const commonKeyExtra = getKeyParts(fullKeysArray[0])[1]; // get keyExtra

  const groupPropInfo = propInfoForItems;
  const groupName = resolvePropInfoName(groupPropInfo, commonKeyExtra);

  const version = useVersion();

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
    {/* <ValidationIndicator otherIndsValidity={keysValidity} /> */}
    <MultiValidationIndicator otherIndsValidity={keysValidity} keyBasesNamingMap={relatedNamingMapForItems} />
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
      <PropNameNoteIndicator note={note} />
      <div className="propname-fullkey">
        {keyBasesArray.map(keyBase =>
          <div key={keyBase}>
            <span key={keyBase}>@{partsToKey(keyBase, commonKeyExtra)}@</span>
          </div>
        )}
      </div>
    </div>
  );
}
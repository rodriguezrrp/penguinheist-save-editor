
import { dropdownOptionsDataContainsValue, getPreviewImagePromise } from "./dropdownCaching";
import Select from "react-select";
import "./select.scss";
import AsyncImage from "../../AsyncImage";

const customSelectTheming = (theme) => ({
  ...theme,
  // borderRadius: 0,
  // borderRadius: 3,
  colors: {
    ...theme.colors,
    primary25: 'var(--react-select-primary25)',
    primary: 'var(--react-select-primary)',
  },
});

const formatOptionLabelPlain = (opt) => opt.label;
const formatOptionLabelWithImage = (opt) => {
  // opt.imgname is expected to be either a string or a promise-like object that returns a string
  let imgname = opt.imgname;
  let imgElem;
  if(Array.isArray(imgname)) {
    imgElem = imgname.map((imgstr, i) => (
      <AsyncImage key={imgstr}
        src={getPreviewImagePromise(opt.imgcachetype, imgstr.replace(/\.[a-z]+$/i,''))}  // strip extension from imgname
        alt={`image preview number ${i+1} for item ${opt.name || opt.label}`}
        className="sel-preview-img"
      />
    ));
  }
  else {
    // check for promise-like behavior by checking it is then-able
    // let isStrOrPromise = (typeof(imgname) === "string" || typeof(imgname?.then) === "function");
    imgElem = imgname && <AsyncImage
      // src={isStrOrPromise && getPreviewImagePromise(opt.imgcachetype, imgname.replace(/\.[a-z]+$/i,''))}  // strip extension from imgname
      src={getPreviewImagePromise(opt.imgcachetype, imgname.replace(/\.[a-z]+$/i,''))}  // strip extension from imgname
      alt={`image preview for item ${opt.name || opt.label}`}
      className="sel-preview-img"
    />;
  }
  return <div className="sel-option-with-preview">
    {imgElem}
    <span>{opt.label}</span>
  </div>
};

export function SelectEditor({ saveDataValue, handleValueUpdate, dropdownOptions, dropdownType, className="", disabled=false }) {
  // console.log('SelectEditor created');
  // let hasSaveDataValue = typeof(dropdownOptions?.find((v) => String(v.props.value) === String(saveDataValue))) !== "undefined";
  const _saveDataValueToString = String(saveDataValue);
  // let hasSaveDataValue = dropdownOptions?.some((v) => String(v.props.value) === _saveDataValueToString);
  let hasSaveDataValue = dropdownOptionsDataContainsValue(dropdownOptions, _saveDataValueToString);
  // console.log(saveDataValue, _saveDataValueToString, hasSaveDataValue);
  let selectElem;
  let _selectFormatOptionLabelFn = formatOptionLabelPlain;
  switch(dropdownType) {
    case "searchablewithimages":
      _selectFormatOptionLabelFn = formatOptionLabelWithImage;
    // eslint-disable-next-line no-fallthrough
    case "searchable":
      selectElem = <Select
        options={dropdownOptions}
        value={dropdownOptions?.find(opt => String(opt.value) === _saveDataValueToString) || ''}
        onChange={(opt) => { handleValueUpdate(opt.value) }}
        placeholder="Type to search..."
        classNamePrefix={"sel"}
        className={"sel-container" + (className ? " " + className : "")}
        theme={customSelectTheming}
        isOptionDisabled={opt => opt.disabled}
        formatOptionLabel={_selectFormatOptionLabelFn}
        isDisabled={disabled}
      />
      break;
    default:
      console.error(`Unexpected dropdownType "${dropdownType}"! Defaulting to "plain" type.`)
    // eslint-disable-next-line no-fallthrough
    case "plain":
      selectElem = <select
        className={className}
        onChange={e => {
            // console.log('pre handleValueUpdate:', saveDataValue, e); console.log('e.target.value:', e.target.value);
            handleValueUpdate(e.target.value)
        }}
        value={hasSaveDataValue ? saveDataValue : ''}
        disabled={disabled}
      >;
        {dropdownOptions}
      </select>;
      break;
  }
  return selectElem;
}
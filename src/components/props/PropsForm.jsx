import { Category, BadSaveDataCategory } from "./Category";
import { Editor, ItemSpecialEditor } from "./Editor";
import { useStoreSetAll } from "../../context/SaveDataContext";
import { useRef } from "react";
import { useEditorStyle } from "../../context/EditorStyleContext";
import { getKeyParts, partsToKey } from "../../utils/keyUtils";
import { useBadSaveData } from "../../context/BadSaveDataContext";
import { BadSaveDataRow } from "./BadSaveDataRow";
import { useVersion } from "../../context/VersionContext";
import { versionInfo } from "../../data";

// //Partition function
// //https://stackoverflow.com/questions/11731072/dividing-an-array-by-filter-function
// function partition(array, filter) {
//   let pass = [], fail = [];
//   array.forEach((e, idx, arr) => (filter(e, idx, arr) ? pass : fail).push(e));
//   return [pass, fail];
// }

function regularEditorsFromObj(categoryId, categoryKeysDataObj) {
  return regularEditorsFromEntries(categoryId, Object.entries(categoryKeysDataObj));
}
function regularEditorsFromEntries(categoryId, entries) {
  return entries.map(([fullkey, value]) => regularEditorFromFullKey(categoryId, fullkey));
}
// function regularEditorFromEntry(categoryId, [fullkey, value]) {
function regularEditorFromFullKey(categoryId, fullKey) {
  return <Editor
    key={fullKey}
    fullKey={fullKey}
    categoryId={categoryId}
  />;
}
// .filter((keyExtra,i,a) => a.indexOf(keyExtra)===i)  // make the strings unique; could be quicker with a [...new Set( .. )]
function casedEditorsFromObj(categoryId, categoryKeysDataObj) {
  switch(categoryId) {
    case 'items':
      // let [itemEntries, otherEntries] = partition(Object.entries(categoryKeysDataObj), ([k,v]) => 
      //   k.startsWith('itemAvailable')
      //   || k.startsWith('itemOwned')
      //   || k.startsWith('newBlueprint')
      //   || k.startsWith('decipheredHint')
      // );
      // let specialEditors = [];
      // for (const [fullKey, value] of itemEntries) {
      //   //
      // }
      //   .map(([fullKey, value]) => getKeyParts(fullKey)[1])
      //   .map((keyExtra) => (
      //     <ItemSpecialEditor
      //       fullKey=
      //     />
      //   ));
      // // TODO: could re-interlace to "preserve" order somehow, as a QoL change?
      // return specialEditors.concat(regularEditorsFromEntries(otherEntries));
      
      const _placeholderKeyBase = 'itemOwned';  // chose the key 'itemOwned' to avoid any collisions with other real fullKeys.
      let mappedEditors = {};
      for(const fullKey of Object.keys(categoryKeysDataObj)) {
        const [keyBase, keyExtra] = getKeyParts(fullKey);
        const isSpecial = (
          keyBase === 'itemAvailable'
          || keyBase === 'itemOwned'
          || keyBase === 'newBlueprint'
          || keyBase === 'decipheredHint');
        if(isSpecial) {
          // save the real key into its corresponding Set of related keys, for an editor later
          const _placeholderKey = partsToKey(_placeholderKeyBase, keyExtra);
          if(mappedEditors[_placeholderKey]) {
            mappedEditors[_placeholderKey].add(fullKey);
          } else {
            mappedEditors[_placeholderKey] = new Set([fullKey]);
          }
        } else {
          mappedEditors[fullKey] = fullKey;
        }
      }
      return Object.entries(mappedEditors).map(([key, value]) => {
        if(getKeyParts(key)[0] === _placeholderKeyBase) {
          if(!Array.isArray(value)) value = Array.from(value);
          if(!value.length) throw new Error(`Expected at least one keyBase for special editor; special key ${key}`);
          return <ItemSpecialEditor
            key={key}
            categoryId={categoryId}
            fullKeysArray={value}
          />;
        } else {
          return regularEditorFromFullKey(categoryId, value);
        }
      });

    // case "outfits":
    //   return null;
    
    // case "outfits":
    //   return null;

    default:
      return regularEditorsFromObj(categoryId, categoryKeysDataObj);
  }
}


function PropsForm() {
  // console.log('PropsForm created');

  const version = useVersion(); // creating dependency on VersionContext
  const info = versionInfo[version];
  let versionName;
  if(info) { versionName = info.long_name || info.name; }
  if(versionName && info.name_suffix) { versionName += ' ' + info.name_suffix; }

  const badSaveData = useBadSaveData(); // creating dependency on BadSaveDataContext

  // https://react.dev/reference/react/useSyncExternalStore
  //  memoizing/caching function's result, preventing re-renders from the getSnapshot callback having technically different objects
  const cachedStrippedData = useRef(null);

  function stripValsCached(/**@type Record<string,Record<string,string>>*/data) {
    let strippedData = Object.fromEntries(
      Object.entries(data)
            .map(([cId, cData]) => [cId,
              Object.fromEntries(Object.entries(cData).map(([key,_]) => [key,null]))
            ]));
    // object DEEP comparison; ORDER MATTERS too!
    if (JSON.stringify(strippedData) !== JSON.stringify(cachedStrippedData.current)) {
      console.log('changing cachedStrippedData to ', strippedData);
      cachedStrippedData.current = strippedData;
    }
    return cachedStrippedData.current;
  }

  const editorStyle = useEditorStyle();
  const [saveDataStrippedVals, ] = useStoreSetAll((data) => stripValsCached(data));
  // console.log('PropsForm: saveDataStrippedVals:', saveDataStrippedVals);
  
  let normalCategories;
  if(editorStyle === 'special') {
    normalCategories = Object.entries(saveDataStrippedVals).map(([categoryId, categoryKeysDataObj]) => (
      <Category key={categoryId} categoryKey={categoryId}>
        {casedEditorsFromObj(categoryId, categoryKeysDataObj)}
      </Category>
    ));
  } else {
    normalCategories = Object.entries(saveDataStrippedVals).map(([categoryId, categoryKeysDataObj]) => (
      <Category key={categoryId} categoryKey={categoryId}>
        {regularEditorsFromObj(categoryId, categoryKeysDataObj)}
      </Category>
    ));
  }

  return (
    <form id="saveForm">
      {/* debug the height of form inputs */}
      {/* <div style={{backgroundColor:"goldenrod"}}>
        <select style={{width:'17vw'}}>
          <option>Hello</option>
        </select>
        <input type="text" style={{width:'17vw'}} placeholder="Hello"/>
        <button type="button" style={{width:'17vw'}}>Hello</button>
        <input type="range" style={{width:'17vw'}} min={0} max={2} value={0.5}/>
      </div> */}
      {badSaveData.length > 0 && <BadSaveDataCategory>
        {/* {<span>debug: badSaveData: {badSaveData.map((badLineData,i)=><><br/>{i}: {`${badLineData}`}</>)}</span>} */}
        <div style={{paddingTop: '2px', paddingBottom: '2px'}}><span>When reading save file as game version "{versionName}",
          {' '}{badSaveData.length} unreadable lines of data were found.</span></div>
        {badSaveData.map((badLineData, i) => <BadSaveDataRow key={i} ind={i} badLineData={badLineData} />)}
      </BadSaveDataCategory>}
      {normalCategories}
    </form>
  );
}

export default PropsForm;
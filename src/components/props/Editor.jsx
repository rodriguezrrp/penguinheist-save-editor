import { partsToHtmlSafeKey, partsToKey } from "../../utils/keyUtils";
import { useStore } from "../../context/SaveDataContext";
import { useVersion } from "../../context/VersionContext";
import { saveDataValid } from "../../utils/validUtils";

// export function Editor({ keyBase, keyExtra, keyValue }) {
export function Editor({ keyBase, keyExtra }) {
  // console.log(`Editor created keyBase ${keyBase} keyExtra ${keyExtra}`);
  console.log(`Editor created "${keyBase}" "${keyExtra}"`);
  const htmlSafeKey = partsToHtmlSafeKey(keyBase, keyExtra);
  const spacedKey = partsToKey(keyBase, keyExtra);
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
                                                            return store[spacedKey]});
  console.log('here right after useStore');

  const version = useVersion(); // note this is causing a dependency on the version Context; should not be an issue for rerendering
  const isValid = saveDataValid(saveDataValue, keyBase, keyExtra, version);

  return (
    <div id={'editorRow-'+htmlSafeKey} className="editor-row">
      {/* <span>keyBase {keyBase} - keyExtra {keyExtra} - value {keyValue}</span> */}
      <span style={{display:'inline-block',width:'40vw'}}>keyBase {keyBase} - keyExtra {keyExtra}</span>
      
      {/* <br/> */}
      <span style={{display:'inline-block',width:'2rem',color:(isValid?'green':'red')}}>{isValid?'✔':'✘'}</span>
      <input
        type="text"
        value={saveDataValue ?? ''} /* the '' is to keep the input "controlled" in React incase saveDataValue isn't provided */
        onChange={e => {
          setSaveData({[spacedKey]: e.target.value})
        }}
      />

      <input
        type="text"
        disabled
        value={saveDataValue ?? ''} /* the '' is to keep the input "controlled" in React incase saveDataValue isn't provided */
        onChange={e => {
          setSaveData({[spacedKey]: e.target.value})
        }}
      />
    </div>
  )

}

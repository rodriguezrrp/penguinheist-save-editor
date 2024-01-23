import { useSaveDataDispatch } from "../../context/SaveDataContext";
import { partsToHtmlSafeKey, partsToKey } from "../../utils/keyUtils";
import { useStore } from "../../context/SaveDataContext";

// export function Editor({ keyBase, keyExtra, keyValue }) {
export function Editor({ keyBase, keyExtra }) {
  console.log(`Editor created keyBase ${keyBase} keyExtra ${keyExtra}`);
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
  const [saveDataValue, setSaveData] = useStore((store) => {console.log('key: '+spacedKey+' store:',store); return store[spacedKey]});
  console.log('here right after useStore');
  return (
    <div id={htmlSafeKey}>
      {/* <span>keyBase {keyBase} - keyExtra {keyExtra} - value {keyValue}</span> */}
      <span>keyBase {keyBase} - keyExtra {keyExtra}</span>
      <br/>
      <input
        type="text"
        value={saveDataValue || ''} /* the short-circuiting with '' is to keep the input "controlled" in React */
        onChange={e => {
          setSaveData({[spacedKey]: e.target.value})
        }}
      />
    </div>
  )

}

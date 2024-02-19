import Category from "./Category";
// import mappedPropCategories from './../../data/mapped_prop_categories.json';
// import mappedPropInfo from './../../data/mapped_prop_info.json';
// import { useSaveData } from "../../context/SaveDataContext";
// import { partsToHtmlSafeKey } from "../../utils/keyUtils";
import { Editor } from "./Editor";
// import { getDefaultsCategorizedFor, getInitialVersion } from "../../utils/saveDataUtils";
import { useStoreSetAll } from "../../context/SaveDataContext";
import { useRef } from "react";


function PropsForm() {
  console.log('PropsForm created');

  // https://react.dev/reference/react/useSyncExternalStore
  //  memoizing/caching result, preventing re-renders from the getSnapshot callback having technically different objects
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

  // let categorizedSaveDataMapping = {};
  // const saveData = useSaveData();
  // const saveData = getInitialRelevantsCategorized();
  // const saveData = getDefaultsCategorizedFor(getInitialVersion());
  
  // const getAll = useStoreGetAll();
  // const [_saveData, setAll] = useStoreSetAll((data) => data);
  // const [saveDataStrippedVals, setAll] = useStoreSetAll((data) => data);
  // const [_saveData, setAll] = useStoreSetAll((data) => Object.entries(data).map(([catId, catData]) => Object.keys(catData)));
  // const [_saveData, setAll] = useStoreSetAll((data) => Object.fromEntries(Object.entries(data)));
  // const [saveDataStrippedVals, setAll] = useStoreSetAll((data) => Object.fromEntries(Object.entries(data)
  //                                                       .map(([cId, cData]) => [cId, Object.fromEntries(Object.entries(cData).map(([key,_]) => [key,null]))])));
  // const saveData = getAll();
  const [saveDataStrippedVals, setAll] = useStoreSetAll((data) => stripValsCached(data));
  console.log('PropsForm: saveDataStrippedVals:', saveDataStrippedVals);
  // return <></>;

  // for(const [keyBase, keyData] of Object.entries(saveData)) {
  // for (const data of saveData) {
  //   const keyCategory = mappedPropInfo[data.keyBase]?.category ?? defaultCategory;

  //   let keyDataArr = categorizedSaveDataMapping[keyCategory];
  //   if(!keyDataArr) {
  //     keyDataArr = [];
  //     categorizedSaveDataMapping[keyCategory] = keyDataArr;
  //   }
  //   keyDataArr.push(data);
  // }

  // return (
  //   <form id="saveForm">
  //     {Object.entries(categorizedSaveDataMapping).map((entry) => {
  //       const [keyCategory, keyDataArr] = entry;
  //       return keyDataArr.map(keyData => {
  //         return (
  //           <Category key={keyCategory} keyCategory={keyCategory}>
  //             {
  //               keyData.extras.map(extra => {
  //                 return (
  //                   <Editor
  //                     key={extra.keyExtra}
  //                     keyBase={keyData.keyBase} keyExtra={extra.keyExtra} keyValue={extra.value}
  //                   />
  //                 );
  //               })
  //             }
  //           </Category>
  //         );
  //       });
  //     })}
  //   </form>
  // );
  // return (
  //   <form id="saveForm">
  //     {saveData.map((categoryEntry) => {
  //       const catid = categoryEntry.categoryId;
  //       const keysData = categoryEntry.keysData;
  //       return keysData.map(keyData => {
  //         return keyData.extras.map(extra => {
  //           return (
  //             <Editor
  //               key={extra.keyExtra}
  //               keyBase={keyData.keyBase} keyExtra={extra.keyExtra} keyValue={extra.value}
  //             />
  //           );
  //         })
  //       });
  //     })}
  //   </form>
  // );
  ;
  // return (
  //   <form id="saveForm">
  //     {saveData.map((categoryEntry) => {
  //       const categoryId = categoryEntry.categoryId;
  //       const keysData = categoryEntry.keysData;
  //       return (
  //       <Category key={categoryId} categoryKey={categoryId}>
  //         {keysData.map(keyData => {
  //           const keyBase = keyData.keyBase;
  //           return keyData.extras.map(extra => {
  //             return (
  //               <Editor
  //                 key={extra}
  //                 keyBase={keyBase} keyExtra={extra}
  //                 // fullKey={fullKey}
  //               />
  //             );
  //           })
  //         })}
  //       </Category>
  //       )
  //     })}
  //   </form>
  // );
  return (
    <form id="saveForm">
      {/* {Object.entries(saveData).map(([categoryId, categoryKeysDataObj]) => ( */}
      {Object.entries(saveDataStrippedVals).map(([categoryId, categoryKeysDataObj]) => (
        <Category key={categoryId} categoryKey={categoryId}>
          {Object.entries(categoryKeysDataObj).map(([fullKey, value]) => (
            <Editor
              key={fullKey}
              // keyBase={keyBase} keyExtra={extra}
              fullKey={fullKey}
              categoryId={categoryId}
            />
          ))}
        </Category>
      ))}
    </form>
  );
}

export default PropsForm;
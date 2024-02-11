import Category from "./Category";
// import mappedPropCategories from './../../data/mapped_prop_categories.json';
// import mappedPropInfo from './../../data/mapped_prop_info.json';
// import { useSaveData } from "../../context/SaveDataContext";
// import { partsToHtmlSafeKey } from "../../utils/keyUtils";
import { Editor } from "./Editor";
// import { getDefaultsCategorizedFor, getInitialVersion } from "../../utils/saveDataUtils";
import { useStoreGetAll } from "../../context/SaveDataContext";

function PropsForm() {
  console.log('PropsForm created');

  // let categorizedSaveDataMapping = {};
  // const saveData = useSaveData();
  // const saveData = getInitialRelevantsCategorized();
  // const saveData = getDefaultsCategorizedFor(getInitialVersion());
  const getAll = useStoreGetAll();
  const saveData = getAll();
  console.log('PropsForm: saveData:', saveData);

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
      {Object.entries(saveData).map(([categoryId, categoryKeysDataObj]) => (
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
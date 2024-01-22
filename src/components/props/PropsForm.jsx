import Category from "./Category";
import mappedPropCategories from './../../data/mapped_prop_categories.json';
import mappedPropInfo from './../../data/mapped_prop_info.json';
import { useSaveData, useSaveDataDispatch } from "../../context/SaveDataContext";

const defaultCategory = "unknown";

function PropsForm() {
  console.log('PropsForm created');

  let categorizedSaveDataMapping = {};
  const saveData = useSaveData();
  console.log('PropsForm: saveData:', saveData);

  // for(const [keyBase, keyData] of Object.entries(saveData)) {
  for (const data of saveData) {
      const keyCategory = mappedPropInfo[data.keyBase]?.category ?? defaultCategory;

      let keyDataArr = categorizedSaveDataMapping[keyCategory];
      if(!keyDataArr) {
          keyDataArr = [];
          categorizedSaveDataMapping[keyCategory] = keyDataArr;
      }
      keyDataArr.push(data);
  }

  return (
    <form id="saveForm">
      {Object.entries(categorizedSaveDataMapping).map((entry) => {
        const [keyCategory, keyDataArr] = entry;
        return keyDataArr.map(keyData => {
          return (
            <Category key={keyCategory} keyCategory={keyCategory}>
              {
                keyData.extras.map(extra => {
                  return (
                    <div>
                      <span>keyBase {keyData.keyBase} - keyExtra {extra.keyExtra} - value {extra.value}</span>
                    </div>
                  );
                })
              }
            </Category>
          );
        });
      })}
    </form>
  );
}

export default PropsForm;
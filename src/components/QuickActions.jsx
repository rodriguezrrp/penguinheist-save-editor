import { useStore, useStoreMapOverCategory, useStoreSetAll } from "../context/SaveDataContext";
import { useVersion } from "../context/VersionContext";
import { getCompleteCategorizedSaveDataFor } from "../utils/saveDataUtils";
import { versionHasBlueprints, versionHasLockableHeists, versionHasStructures } from "../utils/validUtils";


function QuickActions() {
  console.log('QuickActions created');
  
  const [, mapOverCategory] = useStoreMapOverCategory(v => null);  // a constant return from the callback prevents React re-rendering
  const [, setSaveData] = useStore(v => null);  // a constant return from the callback prevents React re-rendering
  
  // note: the setAll is used by the reset button only
  const [, setAllData] = useStoreSetAll(v => null);  // a constant return from the callback prevents React re-rendering
  

  const version = useVersion(); // creating dependency on version context
  

  return <card style={{margin: '1em', '--border-color': 'var(--grayblue)'}}>
    <h2>Quick Actions</h2>
    <div style={{display: 'grid', gridTemplateRows: 'repeat(1, 1fr)', gridTemplateColumns: 'repeat(12, 1fr)'
                , gap: '.5rem', margin: '.5rem'}}>
      <button type="button" id="quickActionMoney" className="quick-action-button"
        onClick={(e) => setSaveData('money', 'money', 1000000)}
      >
        1 Million Money
      </button>
      <button type="button" id="quickActionStamps" className="quick-action-button"
        onClick={(e) => setSaveData('money', 'stamps', 1000)}
      >
        1000 Stamps
      </button>
      <button type="button" id="quickActionItems" className="quick-action-button"
        // note: the item props -- as a boolean -- is expecting strings '1' or '0', not numbers 1 or 0
        onClick={(e) => mapOverCategory('items', (kv) => kv[0].startsWith('itemOwned') ? [kv[0], '1'] : kv)}
      >
        Get All Items
      </button>
      <button type="button" id="quickActionBlueprints" className="quick-action-button"
        // note: the blueprint props -- as a boolean -- is expecting strings '1' or '0', not numbers 1 or 0
        onClick={(e) => mapOverCategory('items', (kv) => kv[0].startsWith('newBlueprint') ? [kv[0], '1'] : kv)}
        disabled={!versionHasBlueprints(version)}
      >
        Get All Blueprints
      </button>
      <button type="button" id="quickActionClothing" className="quick-action-button"
        // note: the clothing props -- as a boolean -- is expecting strings '1' or '0', not numbers 1 or 0
        onClick={(e) => mapOverCategory('clothing', (kv) => kv[0].startsWith('clothingOwned') ? [kv[0], '1'] : kv)}
      >
        Get All Clothing
      </button>
      <button type="button" id="quickActionStructures" className="quick-action-button"
        // note: the structure props -- as a boolean -- is expecting strings '1' or '0', not numbers 1 or 0
        onClick={(e) => mapOverCategory('structures', (kv) => kv[0].startsWith('hasStructure') ? [kv[0], '1'] : kv)}
        disabled={!versionHasStructures(version)}
      >
        Get All Structures
      </button>
      <button type="button" id="quickActionHeists" className="quick-action-button"
        // note: the heist props -- as a boolean -- is expecting strings '1' or '0', not numbers 1 or 0
        onClick={(e) => mapOverCategory('heists', (kv) => kv[0].startsWith('finishedHeist') ? [kv[0], '1'] : kv)}
        disabled={!versionHasLockableHeists(version)}
      >
        Unlock All Heists
      </button>
      <button type="button" id="quickActionReset" className="quick-action-button"
        onClick={(e) => setAllData(getCompleteCategorizedSaveDataFor(version))}
      >
        Reset to Default
      </button>
    </div>
  </card>;
}

export default QuickActions;
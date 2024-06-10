
const _nbspElem = <>&nbsp;</>;

export function BadSaveDataRow({ badLineData, ind }) {
  console.log(badLineData);
  const line = badLineData.badline;
  const formatWithNbsps = (str) => Array.from(str).map(c => c === ' ' ? _nbspElem : c);
  const parts = badLineData.parts ?? [];

  return <div className="editor-row bad-save-data-row">
    <div className="bad-save-data-index">&#x2116;&nbsp;{ind+1}:</div>
    <div className="bad-save-data-container">
      <table className="bad-save-data-table">
        <thead>
          <th colSpan={2} className="fw-normal mono-text" style={{textAlign:'start'}}><mark className="hoverable">{formatWithNbsps(line)}</mark></th>
        </thead>
        <tbody>
          {parts.length >= 2 && parts[0] && <tr><td>Unexpected part before possible key:</td><td className="fw-normal mono-text"><mark className="hoverable">{formatWithNbsps(parts[0])}</mark></td></tr>}
          {parts.length >= 2 && <tr><td>Possible key:</td><td className="fw-normal mono-text"><mark className="hoverable">{formatWithNbsps(parts[1])}</mark></td></tr>}
          {parts.length >= 3 && <tr><td>Possible value:</td><td className="fw-normal mono-text"><mark className="hoverable">{formatWithNbsps(parts[2])}</mark></td></tr>}
          {parts.length >= 4 && <>
            <tr><td rowSpan={parts.length - 3} style={{verticalAlign:'top'}}>Unexpected data after possible value:</td>
              <td className="fw-normal mono-text"><mark className="hoverable">{formatWithNbsps(parts[3])}</mark></td>
            </tr>
            {parts.slice(4).map((part, i) => <tr><td key={i} className="fw-normal mono-text"><mark className="hoverable">{formatWithNbsps(part)}</mark></td></tr>)}
          </>}
        </tbody>
      </table>
    </div>
  </div>;
}
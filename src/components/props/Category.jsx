// import { useState } from "react";
import { getCategoryInfo } from "../../data";


function Category({ categoryKey, children }) {
  console.log('Category created categoryKey ' + categoryKey);
  const categoryInfo = getCategoryInfo(categoryKey);
  // const [show, setShow] = useState(Boolean(categoryInfo.expanded));
  return (
    <details id={'category-'+categoryKey} className="category" open={categoryInfo.expanded}>
      <summary className="category-title-row">
        <span>{categoryInfo.name}</span>
        {/* &nbsp; */}
        {/* <button type="button" onClick={(e) => setShow(!show)}>{show ? 'hide' : 'show'}</button> */}
      </summary>
      <div className="col" style={{paddingLeft:'1rem'}}>
        {children}
      </div>
    </details>
  );
}

export default Category;
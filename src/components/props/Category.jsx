import { useState } from "react";
import { getCategoryInfo } from "../../data";


function Category({ categoryKey, children }) {
  console.log('Category created categoryKey ' + categoryKey);
  const categoryInfo = getCategoryInfo(categoryKey);
  const [show, setShow] = useState(Boolean(categoryInfo.expanded));
  return (
    <div id={'category-'+categoryKey} className="category">
      <div className="category-title-row" style={{background: 'linear-gradient(10deg,#fff,#bbb)'}}>
        <span><strong>Category "{categoryInfo.name}" (key "{categoryKey}")</strong></span>
        &nbsp;
        <button type="button" onClick={(e) => setShow(!show)}>{show ? 'hide' : 'show'}</button>
      </div>
      <div className="col" style={{...{paddingLeft:'1rem'}, ...(show?{}:{display:'none'})}}>
        {children}
      </div>
    </div>
  );
}

export default Category;
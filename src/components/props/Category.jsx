// import { useState } from "react";
import { getCategoryInfo } from "../../data";


function Category({ categoryKey, children }) {
  console.log('Category created categoryKey ' + categoryKey);
  const categoryInfo = getCategoryInfo(categoryKey);
  // const [show, setShow] = useState(Boolean(categoryInfo.expanded));
  return (
    <details id={'category-'+categoryKey} className="category" open={categoryInfo.expanded}>
      <summary className="category-title-row">

        <svg className="icon category-icon" 
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          {/* fill-rule changed to fillRule for React */}
          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"></path>
        </svg>

        <span>{categoryInfo.name}</span>
        {/* &nbsp; */}
        {/* <button type="button" onClick={(e) => setShow(!show)}>{show ? 'hide' : 'show'}</button> */}
      </summary>
      <div className="col category-contents-col">
        {children}
      </div>
    </details>
  );
}

export default Category;
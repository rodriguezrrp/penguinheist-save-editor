

function Category({ categoryKey, children }) {
  console.log('Category created categoryKey ' + categoryKey);
  return (
    <div id={'category-'+categoryKey} className="category">
      <span><strong>Category "{categoryKey}"</strong></span>
      <div className="col" style={{'padding-left':'1rem'}}>
        {children}
      </div>
    </div>
  );
}

export default Category;
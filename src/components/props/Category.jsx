

function Category({ categoryKey, children }) {
  console.log('Category created categoryKey ' + categoryKey);
  return (
    <div id={'category-'+categoryKey} className="category">
      <span>Category "{categoryKey}"</span>
      <div className="col">
        {children}
      </div>
    </div>
  );
}

export default Category;


function Category({ categoryKey, children }) {
  console.log('Category created categoryKey ' + categoryKey);
  return (
    <div>
      <span>Category "{categoryKey}"</span>
      <div>
        {children}
      </div>
    </div>
  );
}

export default Category;


function Category({ keyCategory, children }) {
    console.log('Category created');
    return (
        <div>
            <span>Category "{keyCategory}"</span>
            <div>
                {children}
            </div>
        </div>
    );
}

export default Category;
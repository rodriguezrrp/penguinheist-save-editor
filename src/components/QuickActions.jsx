

function QuickActions() {
  console.log('QuickActions created');
  return (
    <div>
      <card style={{margin:'1em', '--border-color': 'var(--grayblue)'}}>
        <h2>Quick Actions</h2>
        {/* <div className="row">
          {['Apple','Orange Pie','Divvy Davvy','Lorem Ipsum Dolor',
          'Cheese and Curds','Burger Barn','Durble Squible','Argigiegg ei'].map((v,i)=>{
            return <button className="col-25">
              {v}
            </button>
          })}
        </div> */}
        <div style={{display: 'grid', gridTemplateRows: 'repeat(1, 1fr)', gridTemplateColumns: 'repeat(12, 1fr)'
                    , gap: '.5rem', margin: '.5rem'}}>
          {
          // ['Apple','Orange Pie','Divvy Davvy','Lorem Ipsum Dolor',
          // 'Cheese and Curds','Burger Burger','Durble Squible','Argigiegg ei']
          [
            '1 Million Money',
            '1000 Stamps',
            'Get All Items',
            'Get All Blueprints',
            // 'Get All Hints',
            'Get All Clothing',
            'Get All Structures',
            'Unlock All Heists',
            'Reset to Default'
          ]
          .map((v,i)=>{
            return <button style={{gridColumn: 'auto/span 3'}}>
              {v}
            </button>
          })}
        </div>
      </card>
    </div>
  );
}

export default QuickActions;
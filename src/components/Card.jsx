

function Card({ children }) {
  console.log('Card created');
  return (
    <div className="card card-width">
      { children }
    </div>
  );
}

export default Card;
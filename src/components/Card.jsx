

function Card({ children }) {
  console.log('Card created');
  return (
    <div className="card w-90vw">
      { children }
    </div>
  );
}

export default Card;
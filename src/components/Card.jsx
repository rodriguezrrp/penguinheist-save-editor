

function Card({ children }) {
  console.log('Card created');
  return (
    <card className="w-90vw">
      { children }
    </card>
  );
}

export default Card;
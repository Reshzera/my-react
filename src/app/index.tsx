import { MyReact, useState } from "../core/myReactCore";

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>My React Implementation</h1>
      <p>This is a basic React-like implementation with state management</p>
      <Counter />
    </div>
  );
}

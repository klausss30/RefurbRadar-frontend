import Home from './pages/Home';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div>
      <Home />
      <Analytics />
    </div>
  );
}

export default App;

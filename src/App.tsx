import Home from './pages/Home';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div>
        <Home />
        <Analytics />
      </div>
    </ThemeProvider>
  );
}

export default App;

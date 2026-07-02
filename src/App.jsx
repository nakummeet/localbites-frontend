/**
 * App root component.
 *
 * Simply renders AppRoutes — all layout and provider logic
 * is handled in main.jsx and the layout components.
 */

import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <div className="app">
      <AppRoutes />
    </div>
  );
}

export default App;

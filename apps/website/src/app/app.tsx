import { Route, Routes, Link } from 'react-router-dom';
import UnitsPage from '../pages/units';

export function App() {
  return (
    <div>
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/units">Units</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/units"
          element={<UnitsPage />}
        />
      </Routes>
      {/* END: routes */}
    </div>
  );
}

export default App;

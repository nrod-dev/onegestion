import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Layout from './components/Layout';
import ReservationList from './components/ReservationList';
import Dashboard from './components/Dashboard';
import DepartmentList from './components/DepartmentList';
import AvailabilitySearch from './components/AvailabilitySearch';
import ReservationForm from './components/ReservationForm';
import GuestList from './components/GuestList';

import Settings from './components/Settings';
import ChangeHistory from './components/ChangeHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reservations" element={<ReservationList />} />
              <Route path="/new-reservation" element={<ReservationForm />} />
              <Route path="/edit-reservation/:id" element={<ReservationForm />} />
              <Route path="/departments" element={<DepartmentList />} />
              <Route path="/availability" element={<AvailabilitySearch />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/history" element={<ChangeHistory />} />
              <Route path="/guests" element={<GuestList />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

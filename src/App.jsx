import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Layout from './components/Layout';
import ReservationList from './components/ReservationList';
import DepartmentList from './components/DepartmentList';
import AvailabilitySearch from './components/AvailabilitySearch';
import ReservationForm from './components/ReservationForm';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<ReservationList />} />
              <Route path="/departments" element={<DepartmentList />} />
              <Route path="/availability" element={<AvailabilitySearch />} />
              <Route path="/new-reservation" element={<ReservationForm />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Schedule from './pages/Schedule';
import BarberDashboard from './pages/BarberDashboard';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('access_token') !== null;
  };

  const isBarber = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.is_barber;
    }
    return false;
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  const BarberRoute = ({ children }) => {
    return isAuthenticated() && isBarber() ? children : <Navigate to="/agendamentos" />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barbeiro"
            element={
              <BarberRoute>
                <BarberDashboard />
              </BarberRoute>
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated() ? (isBarber() ? "/barbeiro" : "/agendamentos") : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
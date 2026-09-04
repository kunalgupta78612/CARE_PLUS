import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout parent route */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Patient Dashboard standalone layout */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient" element={<PatientDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

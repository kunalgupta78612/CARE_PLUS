import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';

// Dummy component jab tak aap asli login page nahi banate
const DummyLogin = () => <div className="p-20 text-center text-2xl">Login Page Content Here</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout parent route hai */}
        <Route path="/" element={<MainLayout />}>
          {/* index true ka matlab hai ki '/' path par LandingPage dikhega */}
          <Route index element={<LandingPage />} />
          {/* '/login' path par DummyLogin dikhega, aur Navbar wahi rahega */}
          <Route path="login" element={<DummyLogin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

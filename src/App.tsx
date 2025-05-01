import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import HomePage from './pages/HomePage';
import BrowseListings from './pages/BrowseListings';
import PropertyDetails from './pages/PropertyDetails';
import MyBids from './pages/MyBids';
import HostDashboard from './pages/HostDashboard';
import Wallet from './pages/Wallet';
import Notifications from './pages/Notifications';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowseListings />} />
        <Route 
          path="/property/:id" 
          element={<PropertyDetails key={window.location.pathname} />} 
        />
        {/* Removed old static bid page route */}

        {/* Protected client routes */}
        <Route element={<RequireAuth allowedRole="client" />}>
          <Route path="/bids" element={<MyBids />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Protected host routes */}
        <Route element={<RequireAuth allowedRole="host" />}>
          <Route path="/host/*" element={<HostDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, Home, Building, User, Globe, Bell, LogOut, DollarSign } from 'lucide-react';
import Button from '../ui/Button';
import LoginModal from '../auth/LoginModal';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  
  const { userRole, userId, balance, setBalance, logout } = useAuthStore();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDeposit = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase.rpc('refund_user_balance', {
        user_id: userId,
        amount: 100
      });

      if (error) throw error;
      setBalance(balance + 100);
    } catch (err) {
      console.error('Error adding funds:', err);
      alert('Failed to add funds. Please try again.');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold text-white">BnBidder</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {userRole !== 'host' && (
              <Link 
                to="/browse" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/browse') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Browse Rentals
              </Link>
            )}
            {userRole === 'host' ? (
              <Link 
                to="/host" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/host') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Host Dashboard
              </Link>
            ) : userRole === 'client' ? (
              <>
                <Link 
                  to="/bids" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/bids') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  My Bids
                </Link>
                <Link 
                  to="/notifications" 
                  className={`text-sm font-medium transition-colors ${
                    isActive('/notifications') ? 'text-indigo-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Notifications
                </Link>
              </>
            ) : null}
          </nav>
          
          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {userRole ? (
              <div className="flex items-center space-x-4">
                {userRole === 'client' && (
                  <div className="flex items-center space-x-2">
                    <Link to="/wallet" className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <DollarSign size={16} className="text-emerald-400" />
                      <span className="text-sm font-medium text-white">{balance.toFixed(2)} USDT</span>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeposit}
                    >
                      + Deposit
                    </Button>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                leftIcon={<User className="h-4 w-4" />}
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {userRole === 'client' && (
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium text-white">{balance.toFixed(2)} USDT</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeposit}
                  >
                    + Deposit
                  </Button>
                </div>
              )}

              <Link 
                to="/" 
                className={`flex items-center space-x-2 p-2 rounded-md ${
                  isActive('/') ? 'bg-gray-800 text-indigo-400' : 'text-gray-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              {userRole !== 'host' && (
                <Link 
                  to="/browse" 
                  className={`flex items-center space-x-2 p-2 rounded-md ${
                    isActive('/browse') ? 'bg-gray-800 text-indigo-400' : 'text-gray-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Globe className="h-5 w-5" />
                  <span>Browse Rentals</span>
                </Link>
              )}
              
              {userRole === 'host' ? (
                <Link 
                  to="/host" 
                  className={`flex items-center space-x-2 p-2 rounded-md ${
                    isActive('/host') ? 'bg-gray-800 text-indigo-400' : 'text-gray-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Building className="h-5 w-5" />
                  <span>Host Dashboard</span>
                </Link>
              ) : userRole === 'client' ? (
                <>
                  <Link 
                    to="/bids" 
                    className={`flex items-center space-x-2 p-2 rounded-md ${
                      isActive('/bids') ? 'bg-gray-800 text-indigo-400' : 'text-gray-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>My Bids</span>
                  </Link>
                  <Link 
                    to="/notifications" 
                    className={`flex items-center space-x-2 p-2 rounded-md ${
                      isActive('/notifications') ? 'bg-gray-800 text-indigo-400' : 'text-gray-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </Link>
                </>
              ) : null}
              
              {userRole ? (
                <button 
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-gray-800 w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <button 
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-gray-800 w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Header;
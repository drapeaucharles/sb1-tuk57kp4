import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Twitter, Instagram, Facebook, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-indigo-500" />
              <span className="text-xl font-bold text-white">BnBidder</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              The next generation rental platform with dynamic pricing through a bidding system.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">For Guests</h3>
            <ul className="space-y-2">
              <li><Link to="/browse" className="text-gray-400 hover:text-indigo-400 text-sm">Browse Rentals</Link></li>
              <li><Link to="/bids" className="text-gray-400 hover:text-indigo-400 text-sm">My Bids</Link></li>
              <li><Link to="/wallet" className="text-gray-400 hover:text-indigo-400 text-sm">Wallet</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-indigo-400 text-sm">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">For Hosts</h3>
            <ul className="space-y-2">
              <li><Link to="/host" className="text-gray-400 hover:text-indigo-400 text-sm">List Property</Link></li>
              <li><Link to="/host/manage" className="text-gray-400 hover:text-indigo-400 text-sm">Manage Listings</Link></li>
              <li><Link to="/host/earnings" className="text-gray-400 hover:text-indigo-400 text-sm">Earnings</Link></li>
              <li><Link to="/host/guide" className="text-gray-400 hover:text-indigo-400 text-sm">Hosting Guide</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-indigo-400 text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-indigo-400 text-sm">Privacy Policy</Link></li>
              <li><Link to="/contracts" className="text-gray-400 hover:text-indigo-400 text-sm">Smart Contracts</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-indigo-400 text-sm">Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} BnBidder. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-500 text-xs">
              Powered by <span className="text-indigo-400">Smart Contracts</span> & <span className="text-indigo-400">USDT</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
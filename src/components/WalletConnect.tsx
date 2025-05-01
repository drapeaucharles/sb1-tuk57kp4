import React, { useState } from 'react';
import { Wallet, Check, AlertTriangle, ExternalLink, CreditCard } from 'lucide-react';
import Button from './ui/Button';
import Card, { CardContent } from './ui/Card';
import { useAuthStore } from '../store/authStore';

interface WalletConnectProps {
  onConnect: () => void;
  isConnected: boolean;
  walletAddress?: string;
  balance?: number;
  frozenFunds?: number;
  platformBalance?: number;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  isConnected,
  walletAddress = '',
  balance = 0,
  frozenFunds = 0,
  platformBalance = 0
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { paymentMethod, setWalletConnected, setWalletAddress } = useAuthStore();
  
  const handleConnect = async () => {
    if (isConnected) return;
    
    setIsLoading(true);
    try {
      await onConnect();
      // Simulate wallet connection with a fake address
      const fakeAddress = '0x' + Math.random().toString(36).substring(2, 15);
      setWalletAddress(fakeAddress);
      setWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        {!isConnected ? (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <Wallet className="h-8 w-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Connect your wallet to place bids and manage your funds.
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onClick={handleConnect}
              leftIcon={<Wallet size={18} />}
            >
              Connect Wallet
            </Button>
            <p className="mt-4 text-xs text-gray-500">
              By connecting, you agree to the Terms of Service and Privacy Policy.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Wallet className="h-6 w-6 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">Connected Wallet</h2>
              </div>
              <div className="flex items-center space-x-1">
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Connected</span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Address</span>
                <a 
                  href={`https://etherscan.io/address/${walletAddress}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center text-sm"
                >
                  View on Explorer
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
              <p className="text-white font-mono mt-1">{formatAddress(walletAddress)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <span className="text-sm text-gray-400">USDT Balance</span>
                <p className="text-white text-lg font-semibold mt-1">${balance.toFixed(2)}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <span className="text-sm text-gray-400">Frozen Funds</span>
                <p className="text-amber-400 text-lg font-semibold mt-1">${frozenFunds.toFixed(2)}</p>
              </div>
            </div>

            {platformBalance > 0 && (
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-400">Platform Balance</span>
                    <p className="text-white text-lg font-semibold mt-1">${platformBalance.toFixed(2)}</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <Button variant="primary" size="sm">
                      Withdraw Balance
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {frozenFunds > 0 && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-6 flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-200 text-sm font-medium">Funds currently frozen</p>
                  <p className="text-amber-200/80 text-xs mt-1">
                    ${frozenFunds.toFixed(2)} USDT is currently frozen for active bids. 
                    This amount will be released if you're outbid.
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<ExternalLink size={16} />}
              >
                View Smart Contract
              </Button>
              <Button
                variant="secondary"
                fullWidth
              >
                Withdraw Funds
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
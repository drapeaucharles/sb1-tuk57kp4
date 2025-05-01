import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import WalletConnect from '../components/WalletConnect';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const Wallet: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId, balance, setBalance, paymentMethod } = useAuthStore();
  
  useEffect(() => {
    if (!userId) return;
    fetchUserBalance();
  }, [userId]);

  const fetchUserBalance = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnect = async () => {
    // In a real app, this would interact with MetaMask or another wallet provider
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsConnected(true);
        resolve();
      }, 1500);
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>
        
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="animate-pulse">
              <div className="bg-gray-800 rounded-xl h-96"></div>
            </div>
          ) : error ? (
            <div className="bg-rose-900/20 border border-rose-800 rounded-xl p-6 text-center">
              <p className="text-rose-200">{error}</p>
            </div>
          ) : (
            <WalletConnect 
              onConnect={handleConnect}
              isConnected={isConnected}
              walletAddress={isConnected ? "0x1a2b3c4d5e6f7g8h9i0j" : undefined}
              balance={isConnected ? 1250.75 : undefined}
              frozenFunds={isConnected ? 325.00 : undefined}
              platformBalance={balance}
            />
          )}
          
          {isConnected && (
            <div className="mt-8 bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">Bid Placed</p>
                      <p className="text-sm text-gray-400">Modern Downtown Loft (3 nights)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-medium">-325.00 USDT</p>
                      <p className="text-xs text-gray-400">2 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">Deposit</p>
                      <p className="text-sm text-gray-400">Added funds from MetaMask</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">+500.00 USDT</p>
                      <p className="text-xs text-gray-400">5 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">Refund</p>
                      <p className="text-sm text-gray-400">Outbid on Luxury Beach Villa</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">+400.00 USDT</p>
                      <p className="text-xs text-gray-400">1 week ago</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">Deposit</p>
                      <p className="text-sm text-gray-400">Initial funds added</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">+1000.00 USDT</p>
                      <p className="text-xs text-gray-400">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
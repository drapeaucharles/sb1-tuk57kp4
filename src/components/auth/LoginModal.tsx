import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Building, User, Loader } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'host'>('client');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { setUserRole, setUserEmail, setUserId } = useAuthStore();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user;
      
      if (!isRegistering) {
        try {
          user = await loginUser(email, password);
          if (user.role !== selectedRole) {
            throw new Error(`This account is registered as a ${user.role}. Please select the correct role and try again.`);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
          
          if (errorMessage === 'User not found') {
            setIsRegistering(true);
            setError('No account found with this email. Would you like to register?');
            setPassword(''); // Clear password for security
          } else if (errorMessage === 'Incorrect password') {
            setError('The password you entered is incorrect. Please try again.');
          } else {
            setError(`Login failed: ${errorMessage}`);
          }
          
          setIsLoading(false);
          return;
        }
      } else {
        try {
          user = await registerUser(email, password, selectedRole);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Registration failed';
          
          if (errorMessage.includes('already registered')) {
            setIsRegistering(false);
            setError('An account with this email already exists. Please log in instead.');
          } else {
            setError(`Registration failed: ${errorMessage}`);
          }
          
          setIsLoading(false);
          return;
        }
      }

      // If we get here, authentication was successful
      setUserRole(user.role);
      setUserEmail(user.email);
      setUserId(user.id);

      onClose();
      navigate(user.role === 'host' ? '/host' : '/browse');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl p-6 w-[90vw] max-w-md z-[101]">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-white">
              {isRegistering ? 'Create Account' : 'Welcome to BnBidder'}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                selectedRole === 'client'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedRole('client')}
            >
              <User size={20} />
              <span>I am a Client</span>
            </button>
            <button
              type="button"
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                selectedRole === 'host'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedRole('host')}
            >
              <Building size={20} />
              <span>I am a Host</span>
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              error={error}
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  {isRegistering ? 'Creating Account...' : 'Logging in...'}
                </>
              ) : (
                isRegistering ? 'Create Account' : (selectedRole === 'host' ? 'Login as Host' : 'Login as Client')
              )}
            </Button>

            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              By {isRegistering ? 'registering' : 'logging in'}, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LoginModal;
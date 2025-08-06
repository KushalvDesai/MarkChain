import { useState } from 'react';
import { useGenerateNonce, useVerifySignature } from './useGraphQL';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useMetaMaskAuth = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const [generateNonce] = useGenerateNonce();
  const [verifySignature] = useVerifySignature();

  const connectWallet = async (): Promise<string | null> => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const walletAddress = accounts[0];
      setAccount(walletAddress);
      return walletAddress;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const signMessage = async (message: string, address: string): Promise<string | null> => {
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      return signature;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const authenticateWithMetaMask = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // 1. Connect wallet first
      const walletAddress = await connectWallet();
      if (!walletAddress) {
        throw new Error('Failed to connect wallet');
      }

      // 2. Generate nonce from backend
      console.log('Generating nonce for wallet:', walletAddress);
      const nonceResult = await generateNonce({
        variables: { walletAddress }
      });

      if (!nonceResult.data) {
        throw new Error('Failed to generate nonce from backend. Make sure the backend is running.');
      }

      const { nonce, message } = nonceResult.data.generateNonce;
      console.log('Generated nonce:', nonce);
      console.log('Message to sign:', message);

      // 3. Sign the message (this will prompt MetaMask)
      const signature = await signMessage(message, walletAddress);
      if (!signature) {
        throw new Error('Failed to sign message. Please approve the signature in MetaMask.');
      }

      console.log('Signature obtained:', signature);

      // 4. Verify signature with backend
      const verifyResult = await verifySignature({
        variables: {
          input: {
            walletAddress,
            signature,
            nonce
          }
        }
      });

      if (!verifyResult.data) {
        throw new Error('Failed to verify signature with backend.');
      }

      const { accessToken, user } = verifyResult.data.verifySignature;
      console.log('Authentication successful:', { accessToken, user });
      
      // Return the data instead of storing it directly
      // The auth context will handle storage
      return { accessToken, user };

    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Extract more specific error message
      let errorMessage = 'Authentication failed';
      if (err.networkError?.result?.errors) {
        errorMessage = err.networkError.result.errors[0]?.message || errorMessage;
      } else if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        errorMessage = err.graphQLErrors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    // Remove localStorage handling since auth context will handle it
  };

  return {
    account,
    isConnecting,
    error,
    connectWallet,
    authenticateWithMetaMask,
    disconnect
  };
};

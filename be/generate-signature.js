const { ethers } = require('ethers');

async function generateTestSignature() {
  // Your MetaMask private key
  const privateKey = '<YOUR_PRIVATE_KEY>';
  const wallet = new ethers.Wallet(privateKey);
  
  console.log('Your MetaMask Wallet Address:', wallet.address);
  
  // STEP 1: Replace this nonce with the actual nonce from your GraphQL response
  const nonce = '8a239d66c849b97bf4f0db1d00fbdbbd010f8c060d6b14e7f8cc0ee010d5ca20';
  const walletAddress = wallet.address;
  
  const message = `Sign this message to authenticate with MarkChain.\n\nNonce: ${nonce}\nWallet: ${walletAddress}`;
  
  console.log('\nMessage to sign:');
  console.log(message);
  
  // Sign the message
  const signature = await wallet.signMessage(message);
  
  console.log('\nGenerated Signature:', signature);
  console.log('\nFor Postman - Use this wallet address:', walletAddress);
  console.log('For Postman - Use this signature:', signature);
  console.log('For Postman - Use this nonce:', nonce);
}

generateTestSignature().catch(console.error);

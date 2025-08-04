const { ethers } = require('ethers');

async function generateTestSignature() {
  // Your MetaMask private key
  const privateKey = '0x1e8ae238e448fa38fc489b369f9e8fa5f57215ad444cae784de204c9d74aab00';
  const wallet = new ethers.Wallet(privateKey);
  
  console.log('Your MetaMask Wallet Address:', wallet.address);
  
  // STEP 1: Replace this nonce with the actual nonce from your GraphQL response
  const nonce = 'e733eed6421a6db96bdeffb5d381ab928a6099fb01519022e47c043d3ddeecbc';
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

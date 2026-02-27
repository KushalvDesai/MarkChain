import { ConfigService } from '@nestjs/config';

export interface BlockchainConfig {
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  network: string;
  chainId: number;
}

export const getBlockchainConfig = (configService: ConfigService): BlockchainConfig => {
  const rpcUrl = configService.get<string>('BLOCKCHAIN_RPC_URL');
  const contractAddress = configService.get<string>('CONTRACT_ADDRESS');
  const privateKey = configService.get<string>('PRIVATE_KEY');
  const network = configService.get<string>('BLOCKCHAIN_NETWORK', 'sepolia');
  const chainId = configService.get<number>('CHAIN_ID', 11155111); // Sepolia testnet

  if (!rpcUrl || !contractAddress || !privateKey) {
    throw new Error('Blockchain configuration is incomplete. Please check your environment variables.');
  }

  return {
    rpcUrl,
    contractAddress,
    privateKey,
    network,
    chainId,
  };
};
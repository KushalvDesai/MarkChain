import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface CredentialData {
  studentName: string;
  studentId: string;
  subject: string;
  grade: string;
  marks?: number;
  semester?: string;
  institution: string;
  issueDate: string;
  issuer: string;
  additionalNotes?: string;
}

interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

@Injectable()
export class IPFSService {
  private readonly logger = new Logger(IPFSService.name);
  private readonly pinataApiUrl = 'https://api.pinata.cloud';

  constructor(private configService: ConfigService) {}

  /**
   * Upload credential data to IPFS via Pinata
   */
  async uploadCredential(credentialData: CredentialData): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('PINATA_API_KEY');
      const secretKey = this.configService.get<string>('PINATA_SECRET_KEY');

      if (!apiKey || !secretKey) {
        throw new Error('Pinata API credentials not configured');
      }

      // Add metadata for better organization
      const metadata = {
        name: `Credential_${credentialData.studentId}_${credentialData.subject}`,
        keyvalues: {
          studentId: credentialData.studentId,
          subject: credentialData.subject,
          issuer: credentialData.issuer,
          timestamp: new Date().toISOString()
        }
      };

      const data = {
        pinataContent: credentialData,
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: 1
        }
      };

      const response = await axios.post(
        `${this.pinataApiUrl}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': secretKey,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      this.logger.log(`Credential uploaded to IPFS: ${ipfsHash}`);
      
      return ipfsHash;
    } catch (error) {
      this.logger.error(`Failed to upload credential to IPFS: ${error.message}`);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Upload any JSON data to IPFS via Pinata
   */
  async uploadJSON(jsonData: any): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('PINATA_API_KEY');
      const secretKey = this.configService.get<string>('PINATA_SECRET_KEY');

      if (!apiKey || !secretKey) {
        throw new Error('Pinata API credentials not configured');
      }

      const metadata = {
        name: `VC_${Date.now()}`,
        keyvalues: {
          type: 'VerifiableCredential',
          timestamp: new Date().toISOString()
        }
      };

      const data = {
        pinataContent: jsonData,
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: 1
        }
      };

      const response = await axios.post(
        `${this.pinataApiUrl}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': secretKey,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      this.logger.log(`JSON data uploaded to IPFS: ${ipfsHash}`);
      
      return ipfsHash;
    } catch (error) {
      this.logger.error(`Failed to upload JSON to IPFS: ${error.message}`);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve credential data from IPFS
   */
  async getCredential(ipfsHash: string): Promise<CredentialData | null> {
    try {
      if (!ipfsHash || ipfsHash.trim() === '') {
        return null;
      }

      // Try multiple IPFS gateways for reliability
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
      ];

      for (const gateway of gateways) {
        try {
          const response = await axios.get(gateway, {
            timeout: 10000 // 10 second timeout
          });
          
          this.logger.log(`Credential retrieved from IPFS: ${ipfsHash}`);
          return response.data as CredentialData;
        } catch (gatewayError) {
          this.logger.warn(`Gateway ${gateway} failed: ${gatewayError.message}`);
          continue;
        }
      }

      throw new Error('All IPFS gateways failed');
    } catch (error) {
      this.logger.error(`Failed to retrieve credential from IPFS: ${error.message}`);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Pin existing IPFS hash to ensure it stays available
   */
  async pinByHash(ipfsHash: string): Promise<boolean> {
    try {
      const apiKey = this.configService.get<string>('PINATA_API_KEY');
      const secretKey = this.configService.get<string>('PINATA_SECRET_KEY');

      if (!apiKey || !secretKey) {
        throw new Error('Pinata API credentials not configured');
      }

      const data = {
        hashToPin: ipfsHash,
        pinataMetadata: {
          name: `Pinned_${ipfsHash}`,
          keyvalues: {
            pinnedAt: new Date().toISOString()
          }
        }
      };

      await axios.post(
        `${this.pinataApiUrl}/pinning/pinByHash`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': secretKey,
          },
        }
      );

      this.logger.log(`IPFS hash pinned: ${ipfsHash}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to pin IPFS hash: ${error.message}`);
      return false;
    }
  }

  /**
   * Test Pinata connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const apiKey = this.configService.get<string>('PINATA_API_KEY');
      const secretKey = this.configService.get<string>('PINATA_SECRET_KEY');

      if (!apiKey || !secretKey) {
        return false;
      }

      const response = await axios.get(`${this.pinataApiUrl}/data/testAuthentication`, {
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey,
        },
      });

      this.logger.log('Pinata connection test successful');
      return response.data.message === 'Congratulations! You are communicating with the Pinata API!';
    } catch (error) {
      this.logger.error(`Pinata connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get pinned files from Pinata
   */
  async getPinnedFiles(limit: number = 10): Promise<any[]> {
    try {
      const apiKey = this.configService.get<string>('PINATA_API_KEY');
      const secretKey = this.configService.get<string>('PINATA_SECRET_KEY');

      if (!apiKey || !secretKey) {
        throw new Error('Pinata API credentials not configured');
      }

      const response = await axios.get(`${this.pinataApiUrl}/data/pinList`, {
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': secretKey,
        },
        params: {
          pageLimit: limit,
          status: 'pinned'
        }
      });

      return response.data.rows || [];
    } catch (error) {
      this.logger.error(`Failed to get pinned files: ${error.message}`);
      return [];
    }
  }
}
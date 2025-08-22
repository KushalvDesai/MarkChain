import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as os from 'os';
import {
  HealthCheckResponse,
  SystemInfoResponse,
  HashDataDto,
  HashResponse,
  ValidateDIDDto,
  ValidateDIDResponse,
} from './dto/utility.dto';

@Injectable()
export class UtilityService {
  private readonly startTime = Date.now();

  // 1. Health Check API
  async healthCheck(): Promise<HealthCheckResponse> {
    const uptime = Date.now() - this.startTime;
    
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime / 1000), // in seconds
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  // 2. System Information API
  async getSystemInfo(): Promise<SystemInfoResponse> {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const uptime = os.uptime();

      return {
        success: true,
        message: 'System information retrieved successfully',
        nodeVersion: process.version,
        platform: os.platform(),
        architecture: os.arch(),
        totalMemory: this.formatBytes(totalMemory),
        freeMemory: this.formatBytes(freeMemory),
        uptime: Math.floor(uptime),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve system information: ${error.message}`,
        nodeVersion: 'N/A',
        platform: 'N/A',
        architecture: 'N/A',
        totalMemory: 'N/A',
        freeMemory: 'N/A',
        uptime: 0,
      };
    }
  }

  // 3. Hash Utility API
  async hashData(hashDataDto: HashDataDto): Promise<HashResponse> {
    try {
      const { data, algorithm = 'sha256' } = hashDataDto;
      
      // Validate algorithm
      const supportedAlgorithms = ['sha256', 'sha512', 'md5', 'sha1'];
      if (!supportedAlgorithms.includes(algorithm)) {
        throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      const hash = createHash(algorithm).update(data).digest('hex');

      return {
        success: true,
        message: 'Data hashed successfully',
        hash,
        algorithm,
        originalData: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to hash data: ${error.message}`,
        hash: '',
        algorithm: hashDataDto.algorithm || 'sha256',
        originalData: hashDataDto.data,
      };
    }
  }

  // 4. Validate DID Format
  async validateDID(validateDIDDto: ValidateDIDDto): Promise<ValidateDIDResponse> {
    try {
      const { did } = validateDIDDto;
      
      // Basic DID format validation (did:method:identifier)
      const didRegex = /^did:([a-z0-9]+):([a-zA-Z0-9._-]+)$/;
      const match = did.match(didRegex);

      if (!match) {
        return {
          success: true,
          message: 'DID validation completed',
          isValid: false,
          did,
          method: undefined,
          network: undefined,
        };
      }

      const [, method, identifier] = match;
      
      // Extract network for ethr method
      let network: string | undefined = undefined;
      if (method === 'ethr') {
        // Check if identifier contains network info (e.g., did:ethr:sepolia:0x...)
        const ethrParts = identifier.split(':');
        if (ethrParts.length > 1) {
          network = ethrParts[0];
        } else {
          network = 'mainnet'; // default
        }
      }

      return {
        success: true,
        message: 'DID validation completed',
        isValid: true,
        did,
        method,
        network,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate DID: ${error.message}`,
        isValid: false,
        did: validateDIDDto.did,
        method: undefined,
        network: undefined,
      };
    }
  }

  // Helper method to format bytes
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Additional utility methods
  async generateNonce(): Promise<{ nonce: string; timestamp: number }> {
    const timestamp = Date.now();
    const randomBytes = createHash('sha256')
      .update(`${timestamp}-${Math.random()}-${process.hrtime.bigint()}`)
      .digest('hex');
    
    return {
      nonce: randomBytes.substring(0, 16),
      timestamp,
    };
  }

  async validateTimestamp(timestamp: number, maxAgeMs: number = 300000): Promise<boolean> {
    const now = Date.now();
    const age = now - timestamp;
    return age >= 0 && age <= maxAgeMs;
  }

  async sanitizeString(input: string): Promise<string> {
    // Remove potentially harmful characters
    return input
      .replace(/[<>\"'%;()&+]/g, '')
      .trim()
      .substring(0, 1000); // Limit length
  }
}

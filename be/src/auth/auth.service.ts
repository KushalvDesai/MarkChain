import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { randomBytes } from 'crypto';

export interface NonceResponse {
  nonce: string;
  message: string;
}

export interface VerifySignatureDto {
  walletAddress: string;
  signature: string;
  nonce: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    walletAddress: string;
    did: string;
    role: UserRole;
    name?: string;
    email?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async generateNonce(walletAddress: string): Promise<NonceResponse> {
    if (!ethers.isAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    const nonce = randomBytes(32).toString('hex');
    const message = `Sign this message to authenticate with MarkChain.\n\nNonce: ${nonce}\nWallet: ${walletAddress}`;

    // Create DID for the wallet
    const did = `did:ethr:${walletAddress.toLowerCase()}`;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingUser) {
      // Only update nonce, keep existing role and other fields
      await this.userModel.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { nonce },
        { new: true }
      );
    } else {
      // Create new user with default role STUDENT
      await this.userModel.create({
        walletAddress: walletAddress.toLowerCase(),
        did: did,
        role: UserRole.STUDENT,
        isActive: true,
        nonce,
      });
    }

    return { nonce, message };
  }

  async verifySignature(verifyDto: VerifySignatureDto): Promise<AuthResponse> {
    const { walletAddress, signature, nonce } = verifyDto;

    if (!ethers.isAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }

    // Find user with matching nonce
    const user = await this.userModel.findOne({
      walletAddress: walletAddress.toLowerCase(),
      nonce
    });

    if (!user) {
      throw new UnauthorizedException('Invalid nonce or wallet address');
    }

    // Verify signature
    const message = `Sign this message to authenticate with MarkChain.\n\nNonce: ${nonce}\nWallet: ${walletAddress}`;
    
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      throw new UnauthorizedException('Invalid signature');
    }

    // Ensure DID is set (should already be set from generateNonce)
    if (!user.did) {
      user.did = `did:ethr:${walletAddress.toLowerCase()}`;
    }

    // Note: DID registration on blockchain will be done separately via the blockchain resolver
    // This keeps the auth service focused on authentication only

    // Ensure role is set
    if (!user.role) {
      user.role = UserRole.STUDENT;
    }

    // Update last login and clear nonce
    user.lastLogin = new Date();
    user.nonce = undefined;
    await user.save();

    // Generate JWT token
    const payload = {
      sub: user._id,
      walletAddress: user.walletAddress,
      did: user.did,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        walletAddress: user.walletAddress,
        did: user.did,
        role: user.role,
        name: user.name
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}

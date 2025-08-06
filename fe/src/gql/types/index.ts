// Input Types
export interface VerifySignatureInput {
  walletAddress: string;
  signature: string;
  nonce: string;
}

// User Types
export interface User {
  _id?: string;
  walletAddress: string;
  did?: string;
  role: UserRole;
  name?: string;
  email?: string;
  subjects?: string[];
  isActive?: boolean;
  lastLogin?: string;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

// Response Types
export interface GenerateNonceResponse {
  generateNonce: {
    nonce: string;
    message: string;
  };
}

export interface VerifySignatureResponse {
  verifySignature: {
    accessToken: string;
    user: {
      walletAddress: string;
      did: string;
      role: UserRole;
      name?: string;
      email?: string;
    };
  };
}

export interface GetAllUsersResponse {
  getAllUsers: User[];
}

export interface GetUserProfileResponse {
  getUserProfile: User;
}

export interface GetUsersByRoleResponse {
  getUsersByRole: User[];
}

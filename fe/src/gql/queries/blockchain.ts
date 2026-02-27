import { gql } from '@apollo/client';

// USER QUERIES
export const GET_MY_BLOCKCHAIN_STATUS = gql`
  query GetMyBlockchainStatus {
    getMyBlockchainStatus {
      walletAddress
      didHash
      blockchainRole
      didRegistered
      hasBlockchainRole
      assignedSubjects
    }
  }
`;

// STUDENT QUERIES
export const GET_MY_SUBJECT_CREDENTIAL = gql`
  query GetMySubjectCredential($subject: String!) {
    getMySubjectCredential(subject: $subject) {
      ipfsHash
      issuer
      updatedAt
      subject
      studentName
      grade
    }
  }
`;

export const GET_MY_BLOCKCHAIN_CREDENTIALS = gql`
  query GetMyBlockchainCredentials {
    getMyBlockchainCredentials {
      ipfsHash
      issuer
      updatedAt
      subject
      studentName
      grade
    }
  }
`;

// PUBLIC QUERIES
export const VERIFY_BLOCKCHAIN_CREDENTIAL = gql`
  query VerifyBlockchainCredential($input: VerifyCredentialInput!) {
    verifyBlockchainCredential(input: $input) {
      ipfsHash
      issuer
      updatedAt
      subject
      studentName
      grade
    }
  }
`;

// UTILITY QUERIES
export const GET_BLOCKCHAIN_NETWORK_INFO = gql`
  query GetBlockchainNetworkInfo {
    getBlockchainNetworkInfo {
      contractAddress
      walletAddress
      network
      chainId
      isConnected
    }
  }
`;

export const TEST_IPFS_CONNECTION = gql`
  query TestIPFSConnection {
    testIPFSConnection
  }
`;
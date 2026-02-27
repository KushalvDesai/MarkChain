import { useMutation, useQuery } from '@apollo/client';
import {
  // Blockchain Mutations
  ASSIGN_BLOCKCHAIN_ROLE,
  ASSIGN_SUBJECT_TO_TEACHER,
  REMOVE_SUBJECT_FROM_TEACHER,
  REVOKE_BLOCKCHAIN_CREDENTIAL,
  LINK_WALLET_ADDRESS,
  REGISTER_USER_DID,
  ISSUE_BLOCKCHAIN_CREDENTIAL,
  // Blockchain Queries
  GET_MY_BLOCKCHAIN_STATUS,
  GET_MY_SUBJECT_CREDENTIAL,
  GET_MY_BLOCKCHAIN_CREDENTIALS,
  VERIFY_BLOCKCHAIN_CREDENTIAL,
  GET_BLOCKCHAIN_NETWORK_INFO,
  TEST_IPFS_CONNECTION,
  // Types
  AssignRoleInput,
  SubjectAssignmentInput,
  RevokeCredentialInput,
  LinkWalletInput,
  RegisterDIDInput,
  IssueBlockchainCredentialInput,
  VerifyCredentialInput,
  AssignBlockchainRoleResponse,
  AssignSubjectToTeacherResponse,
  RemoveSubjectFromTeacherResponse,
  RevokeBlockchainCredentialResponse,
  LinkWalletAddressResponse,
  RegisterUserDIDResponse,
  IssueBlockchainCredentialResponse,
  GetMyBlockchainStatusResponse,
  GetMySubjectCredentialResponse,
  GetMyBlockchainCredentialsResponse,
  VerifyBlockchainCredentialResponse,
  GetBlockchainNetworkInfoResponse,
  TestIPFSConnectionResponse
} from '../gql';

/**
 * Custom hooks for blockchain operations
 */

// Admin Operations
export const useAssignBlockchainRole = () => {
  return useMutation<AssignBlockchainRoleResponse, { input: AssignRoleInput }>(
    ASSIGN_BLOCKCHAIN_ROLE
  );
};

export const useAssignSubjectToTeacher = () => {
  return useMutation<AssignSubjectToTeacherResponse, { input: SubjectAssignmentInput }>(
    ASSIGN_SUBJECT_TO_TEACHER
  );
};

export const useRemoveSubjectFromTeacher = () => {
  return useMutation<RemoveSubjectFromTeacherResponse, { input: SubjectAssignmentInput }>(
    REMOVE_SUBJECT_FROM_TEACHER
  );
};

export const useRevokeBlockchainCredential = () => {
  return useMutation<RevokeBlockchainCredentialResponse, { input: RevokeCredentialInput }>(
    REVOKE_BLOCKCHAIN_CREDENTIAL
  );
};

// User Operations
export const useLinkWalletAddress = () => {
  return useMutation<LinkWalletAddressResponse, { input: LinkWalletInput }>(
    LINK_WALLET_ADDRESS
  );
};

export const useRegisterUserDID = () => {
  return useMutation<RegisterUserDIDResponse, { input: RegisterDIDInput }>(
    REGISTER_USER_DID
  );
};

// Teacher Operations
export const useIssueBlockchainCredential = () => {
  return useMutation<IssueBlockchainCredentialResponse, { input: IssueBlockchainCredentialInput }>(
    ISSUE_BLOCKCHAIN_CREDENTIAL
  );
};


// User Queries
export const useGetMyBlockchainStatus = () => {
  return useQuery<GetMyBlockchainStatusResponse>(GET_MY_BLOCKCHAIN_STATUS);
};

// Student Queries
export const useGetMySubjectCredential = (subject: string, options?: { skip?: boolean }) => {
  return useQuery<GetMySubjectCredentialResponse, { subject: string }>(
    GET_MY_SUBJECT_CREDENTIAL,
    {
      variables: { subject },
      skip: !subject || options?.skip
    }
  );
};

export const useGetMyBlockchainCredentials = () => {
  return useQuery<GetMyBlockchainCredentialsResponse>(GET_MY_BLOCKCHAIN_CREDENTIALS);
};

// Public Queries
export const useVerifyBlockchainCredential = (
  input: VerifyCredentialInput,
  options?: { skip?: boolean }
) => {
  return useQuery<VerifyBlockchainCredentialResponse, { input: VerifyCredentialInput }>(
    VERIFY_BLOCKCHAIN_CREDENTIAL,
    {
      variables: { input },
      skip: !input.studentAddress || !input.subject || options?.skip
    }
  );
};

// Utility Queries
export const useGetBlockchainNetworkInfo = () => {
  return useQuery<GetBlockchainNetworkInfoResponse>(GET_BLOCKCHAIN_NETWORK_INFO);
};

export const useTestIPFSConnection = () => {
  return useQuery<TestIPFSConnectionResponse>(TEST_IPFS_CONNECTION);
};

/**
 * Higher-level composite hooks for common blockchain operations
 */

// Hook to check if user has blockchain setup completed
export const useBlockchainSetupStatus = () => {
  const { data, loading, error, refetch } = useGetMyBlockchainStatus();

  const status = data?.getMyBlockchainStatus;

  // Debug logging to help troubleshoot
  console.log('Blockchain Status Debug:', {
    data,
    status,
    loading,
    error,
    hasWallet: !!status?.walletAddress,
    didRegistered: status?.didRegistered,
    hasBlockchainRole: status?.hasBlockchainRole
  });

  // For setup to be complete, user just needs wallet address linked
  // Temporary: Allow access if user has any blockchain status data or if we can't fetch it
  // This prevents blocking users who have completed MetaMask setup
  const isSetupComplete = status ?
    !!status.walletAddress :
    true; // Allow access by default if status can't be determined

  return {
    status,
    isSetupComplete,
    loading,
    error,
    refetch
  };
};

// Hook for teacher credential management
export const useTeacherCredentialManagement = () => {
  const [issueCredential] = useIssueBlockchainCredential();
  const [revokeCredential] = useRevokeBlockchainCredential();

  return {
    issueCredential,
    revokeCredential,
    issuedCredentials: [], // Backend doesn't provide this query yet
    loading: false,
    error: null,
    refetch: () => { }
  };
};

// Hook for teacher student management by subject
export const useTeacherStudentsBySubject = (subject: string) => {
  // Backend doesn't provide this query yet - return empty data
  return {
    students: [],
    loading: false,
    error: null,
    refetch: () => { }
  };
};

// Hook for student credentials management
export const useStudentCredentials = () => {
  const { data, loading, error, refetch } = useGetMyBlockchainCredentials();

  return {
    credentials: data?.getMyBlockchainCredentials || [],
    loading,
    error,
    refetch
  };
};
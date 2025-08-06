import { useMutation, useQuery } from '@apollo/client';
import { 
  GENERATE_NONCE, 
  VERIFY_SIGNATURE,
  GET_ALL_USERS,
  GET_USER_PROFILE,
  GET_USERS_BY_ROLE,
  GenerateNonceResponse,
  VerifySignatureResponse,
  GetAllUsersResponse,
  GetUserProfileResponse,
  GetUsersByRoleResponse,
  VerifySignatureInput,
  UserRole
} from '../gql';

// Auth Hooks
export const useGenerateNonce = () => {
  return useMutation<GenerateNonceResponse, { walletAddress: string }>(GENERATE_NONCE);
};

export const useVerifySignature = () => {
  return useMutation<VerifySignatureResponse, { input: VerifySignatureInput }>(VERIFY_SIGNATURE);
};

// User Query Hooks
export const useGetAllUsers = () => {
  return useQuery<GetAllUsersResponse>(GET_ALL_USERS);
};

export const useGetUserProfile = (walletAddress: string) => {
  return useQuery<GetUserProfileResponse, { walletAddress: string }>(
    GET_USER_PROFILE,
    {
      variables: { walletAddress },
      skip: !walletAddress
    }
  );
};

export const useGetUsersByRole = (role: UserRole) => {
  return useQuery<GetUsersByRoleResponse, { role: UserRole }>(
    GET_USERS_BY_ROLE,
    {
      variables: { role }
    }
  );
};

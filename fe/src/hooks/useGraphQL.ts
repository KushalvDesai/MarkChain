import { useMutation, useQuery } from '@apollo/client';
import { 
  GENERATE_NONCE, 
  VERIFY_SIGNATURE,
  UPDATE_USER_PROFILE,
  SEND_OTP_FOR_VERIFICATION,
  VERIFY_OTP_AND_UPDATE_PROFILE,
  GET_ALL_USERS,
  GET_USER_PROFILE,
  GET_USERS_BY_ROLE,
  GenerateNonceResponse,
  VerifySignatureResponse,
  GetAllUsersResponse,
  GetUserProfileResponse,
  GetUsersByRoleResponse,
  SendOTPResponse,
  VerifyOTPResponse,
  VerifySignatureInput,
  SendOTPInput,
  VerifyOTPInput,
  UserRole
} from '../gql';

// Auth Hooks
export const useGenerateNonce = () => {
  return useMutation<GenerateNonceResponse, { walletAddress: string }>(GENERATE_NONCE);
};

export const useVerifySignature = () => {
  return useMutation<VerifySignatureResponse, { input: VerifySignatureInput }>(VERIFY_SIGNATURE);
};

// User Mutation Hooks
export const useUpdateUserProfile = () => {
  return useMutation(UPDATE_USER_PROFILE);
};

export const useSendOTPForVerification = () => {
  return useMutation<SendOTPResponse, { input: SendOTPInput }>(SEND_OTP_FOR_VERIFICATION);
};

export const useVerifyOTPAndUpdateProfile = () => {
  return useMutation<VerifyOTPResponse, { input: VerifyOTPInput }>(VERIFY_OTP_AND_UPDATE_PROFILE);
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

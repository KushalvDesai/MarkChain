import { gql } from '@apollo/client';

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileDto!) {
    updateUserProfile(input: $input) {
      walletAddress
      name
      role
      isActive
      did
      lastLogin
      studentId
    }
  }
`;

export const SEND_OTP_FOR_VERIFICATION = gql`
  mutation SendOTPForVerification($input: SendOTPDto!) {
    sendOTPForVerification(input: $input) {
      success
      message
      email
    }
  }
`;

export const VERIFY_OTP_AND_UPDATE_PROFILE = gql`
  mutation VerifyOTPAndUpdateProfile($input: VerifyOTPInput!) {
    verifyOTPAndUpdateProfile(input: $input) {
      success
      message
      user {
        id
        name
        studentId
        isVerified
        walletAddress
        role
      }
    }
  }
`;
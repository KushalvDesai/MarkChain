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
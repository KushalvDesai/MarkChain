import { gql } from '@apollo/client';

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($walletAddress: String!, $input: UpdateUserProfileDto!) {
    updateUserProfile(walletAddress: $walletAddress, input: $input) {
      _id
      walletAddress
      did
      name
      studentId
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

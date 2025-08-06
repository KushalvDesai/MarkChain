import { gql } from '@apollo/client';

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateStudentProfile($input: UpdateUserProfileDto!) {
    updateUserProfile(input: $input) {
      _id
      walletAddress
      name
      studentId
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

import { gql } from '@apollo/client';

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      _id
      walletAddress
      did
      role
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($walletAddress: String!) {
    getUserProfile(walletAddress: $walletAddress) {
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

export const GET_USERS_BY_ROLE = gql`
  query GetUsersByRole($role: UserRole!) {
    getUsersByRole(role: $role) {
      walletAddress
      name
      role
      isActive
      did
      lastLogin
    }
  }
`;

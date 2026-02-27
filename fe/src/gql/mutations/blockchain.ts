import { gql } from '@apollo/client';

// ADMIN OPERATIONS
export const ASSIGN_BLOCKCHAIN_ROLE = gql`
  mutation AssignBlockchainRole($input: AssignBlockchainRoleInput!) {
    assignBlockchainRole(input: $input) {
      success
      message
      txHash
    }
  }
`;

export const ASSIGN_SUBJECT_TO_TEACHER = gql`
  mutation AssignSubjectToTeacher($input: SubjectAssignmentInput!) {
    assignSubjectToTeacher(input: $input) {
      success
      transactionHash
      message
      error
    }
  }
`;

export const REMOVE_SUBJECT_FROM_TEACHER = gql`
  mutation RemoveSubjectFromTeacher($input: SubjectAssignmentInput!) {
    removeSubjectFromTeacher(input: $input) {
      success
      transactionHash
      message
      error
    }
  }
`;

// USER OPERATIONS
export const LINK_WALLET_ADDRESS = gql`
  mutation LinkWalletAddress($input: LinkWalletInput!) {
    linkWalletAddress(input: $input) {
      success
      transactionHash
      message
      error
    }
  }
`;

export const REGISTER_USER_DID = gql`
  mutation RegisterUserDID($input: RegisterDIDInput!) {
    registerUserDID(input: $input) {
      success
      transactionHash
      message
      error
    }
  }
`;

// TEACHER OPERATIONS
export const ISSUE_BLOCKCHAIN_CREDENTIAL = gql`
  mutation IssueBlockchainCredential($input: IssueBlockchainCredentialInput!) {
    issueBlockchainCredential(input: $input) {
      success
      transactionHash
      message
      error
    }
  }
`;



export const REVOKE_BLOCKCHAIN_CREDENTIAL = gql`
  mutation RevokeBlockchainCredential($input: RevokeCredentialInput!) {
    revokeBlockchainCredential(input: $input) {
      success
      transactionHash
      message
      error
    }
  }
`;
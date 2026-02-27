import { gql } from '@apollo/client';

// GET MY CREDENTIAL
export const GET_MY_CREDENTIAL = gql`
  query GetMyCredential($subject: String!) {
    getMyCredential(subject: $subject) {
      ipfsHash
      version
      totalComponents
      createdAt
      lastUpdatedAt
      expiresAt
      revoked
      isExpired
    }
  }
`;

// GET STUDENT CREDENTIAL
export const GET_STUDENT_CREDENTIAL = gql`
  query GetStudentCredential($input: GetStudentCredentialInput!) {
    getStudentCredential(input: $input) {
      ipfsHash
      version
      totalComponents
      createdAt
      lastUpdatedAt
      expiresAt
      revoked
      isExpired
    }
  }
`;

// CHECK CREDENTIAL VALIDITY
export const IS_CREDENTIAL_VALID = gql`
  query IsCredentialValid($input: IsCredentialValidInput!) {
    isCredentialValid(input: $input)
  }
`;

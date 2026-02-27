import { gql } from '@apollo/client';

// CREATE CREDENTIAL
export const CREATE_CREDENTIAL = gql`
  mutation CreateCredential($input: CreateCredentialInput!) {
    createCredential(input: $input) {
      transactionHash
      success
      message
    }
  }
`;

// UPDATE CREDENTIAL WITH COMPONENT
export const UPDATE_CREDENTIAL_WITH_COMPONENT = gql`
  mutation UpdateCredentialWithComponent($input: UpdateCredentialWithComponentInput!) {
    updateCredentialWithComponent(input: $input) {
      transactionHash
      success
      message
    }
  }
`;

// CREATE SUBJECT
export const CREATE_SUBJECT = gql`
mutation CreateSubject($input: CreateSubjectInput!) {
  createSubject(input: $input) {
    success
    txHash
    subject {
      _id
      subjectName
      blockchainHash
      credits
      description
      createdBy
      isActive
      createdAt
      updatedAt
    }
  }
}
`;

// REGISTER COMPONENT
export const REGISTER_COMPONENT = gql`
  mutation RegisterComponent($input: RegisterComponentInput!) {
    registerComponent(input: $input) {
      txHash
      success
      component {
        _id
        componentName
        subjectName
        blockchainHash
        isActive
        createdBy
        weightage
        maxMarks
        createdAt
        updatedAt
      }
    }
  }
`;

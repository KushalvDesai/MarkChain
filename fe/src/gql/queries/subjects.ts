import { gql } from '@apollo/client';

export const GET_ALL_SUBJECTS = gql`
  query GetAllSubjects {
    getAllSubjects {
      _id
      subjectName
      blockchainHash
      isActive
      createdBy
      description
      credits
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUBJECT_COMPONENTS = gql`
  query GetSubjectComponents($subjectName: String!) {
    getSubjectComponents(subjectName: $subjectName) {
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
`;

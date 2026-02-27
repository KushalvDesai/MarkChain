import { gql } from '@apollo/client';

export const GET_STUDENTS_BY_BATCH = gql`
  query GetStudentsByBatch($batch: String!) {
    getStudentsByBatch(batch: $batch) {
      _id
      did
      walletAddress
      name
      email
      studentId
      role
      isActive
    }
  }
`;

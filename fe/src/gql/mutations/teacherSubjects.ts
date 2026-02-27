import { gql } from '@apollo/client';

export const UPDATE_TEACHER_SUBJECT = gql`
  mutation UpdateTeacherSubject($input: UpdateTeacherSubjectInput!) {
    updateTeacherSubject(input: $input) {
      _id
      subjectName
      batches
      semester
    }
  }
`;

export const DELETE_TEACHER_SUBJECT = gql`
  mutation DeleteTeacherSubject($subjectId: String!) {
    deleteTeacherSubject(subjectId: $subjectId) {
      success
      message
    }
  }
`;

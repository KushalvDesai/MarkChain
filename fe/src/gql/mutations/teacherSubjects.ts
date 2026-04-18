import { gql } from '@apollo/client';

export const CREATE_TEACHER_SUBJECT = gql`
  mutation CreateTeacherSubject($input: CreateTeacherSubjectInput!) {
    createTeacherSubject(input: $input) {
      _id
      teacherDID
      teacherWalletAddress
      teacherName
      subjectCode
      subjectName
      academicYear
      semester
      batches
      department
      isActive
      assignedBy
      assignedAt
    }
  }
`;

export const UPDATE_TEACHER_SUBJECT = gql`
  mutation UpdateTeacherSubject($input: UpdateTeacherSubjectInput!) {
    updateTeacherSubject(input: $input) {
      _id
      subjectCode
      subjectName
      academicYear
      semester
      batches
      isActive
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

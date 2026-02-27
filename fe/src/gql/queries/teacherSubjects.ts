import { gql } from '@apollo/client';

export const GET_ALL_TEACHER_SUBJECTS = gql`
  query GetAllTeacherSubjects {
    getAllTeacherSubjects {
      _id
      teacherDID
      teacherName
      teacherWalletAddress
      subjectCode
      subjectName
      academicYear
      semester
      batches
      department
      isActive
    }
  }
`;

export const GET_TEACHER_SUBJECTS_BY_TEACHER = gql`
  query GetTeacherSubjectsByTeacher($teacherWalletAddress: String!) {
    getTeacherSubjectsByTeacher(teacherWalletAddress: $teacherWalletAddress) {
      _id
      subjectCode
      subjectName
      academicYear
      semester
      batches
    }
  }
`;

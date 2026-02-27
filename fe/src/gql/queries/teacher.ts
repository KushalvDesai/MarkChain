import { gql } from '@apollo/client';

// Get assigned subjects (simple string array)
export const GET_MY_ASSIGNED_SUBJECTS = gql`
  query GetMyAssignedSubjects {
    getMyAssignedSubjects
  }
`;

// Get teacher course setup with detailed information
export const GET_TEACHER_COURSE_SETUP = gql`
  query GetTeacherCourseSetup {
    getTeacherCourseSetup {
      teacherDID
      teacherName
      assignedSubjects {
        subjectCode
        subjectName
        academicYear
        semester
        batches
      }
      totalStudents
      totalCredentials
    }
  }
`;

// Get teacher's students
export const GET_TEACHER_STUDENTS = gql`
  query GetTeacherStudents($batch: String) {
    getTeacherStudents(batch: $batch) {
      studentDID
      studentWalletAddress
      studentName
      studentId
      batch
      hasCredentials
      subjects
    }
  }
`;

// Get teacher's issued credentials
export const GET_TEACHER_CREDENTIALS = gql`
  query GetTeacherCredentials($subject: String) {
    getTeacherCredentials(subject: $subject) {
      credentialId
      studentDID
      studentName
      subject
      grade
      marks
      issuedAt
      ipfsHash
      transactionHash
    }
  }
`;

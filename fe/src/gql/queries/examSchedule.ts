import { gql } from '@apollo/client';

export const GET_ALL_EXAM_SCHEDULES = gql`
  query GetAllExamSchedules {
    getAllExamSchedules {
      _id
      subject
      examName
      examType
      examDate
      duration
      totalMarks
      passingMarks
      venue
      academicYear
      semester
      batch
      status
    }
  }
`;

export const GET_EXAM_SCHEDULE_BY_ID = gql`
  query GetExamScheduleById($examId: String!) {
    getExamScheduleById(examId: $examId) {
      _id
      subject
      examName
      examDate
      venue
      description
      teacherDID
      status
    }
  }
`;

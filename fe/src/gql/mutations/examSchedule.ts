import { gql } from '@apollo/client';

export const CREATE_EXAM_SCHEDULE = gql`
  mutation CreateExamSchedule($input: CreateExamScheduleInput!) {
    createExamSchedule(input: $input) {
      _id
      examName
      subject
      examDate
      venue
      status
    }
  }
`;

export const UPDATE_EXAM_SCHEDULE = gql`
  mutation UpdateExamSchedule($input: UpdateExamScheduleInput!) {
    updateExamSchedule(input: $input) {
      _id
      examName
      venue
      examDate
      status
    }
  }
`;

export const DELETE_EXAM_SCHEDULE = gql`
  mutation DeleteExamSchedule($examId: String!) {
    deleteExamSchedule(examId: $examId) {
      success
      message
    }
  }
`;

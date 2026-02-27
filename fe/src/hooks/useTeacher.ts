import { useQuery } from '@apollo/client';
import {
    // Queries
    GET_MY_ASSIGNED_SUBJECTS,
    GET_TEACHER_COURSE_SETUP,
    GET_TEACHER_STUDENTS,
    GET_TEACHER_CREDENTIALS,
    // Types
    GetMyAssignedSubjectsResponse,
    GetTeacherCourseSetupResponse,
    GetTeacherStudentsResponse,
    GetTeacherCredentialsResponse
} from '../gql';

/**
 * Custom hooks for teacher operations
 */

// Get simple list of assigned subjects (string array)
export const useGetMyAssignedSubjects = () => {
    return useQuery<GetMyAssignedSubjectsResponse>(GET_MY_ASSIGNED_SUBJECTS);
};

// Get detailed teacher course setup
export const useGetTeacherCourseSetup = () => {
    return useQuery<GetTeacherCourseSetupResponse>(GET_TEACHER_COURSE_SETUP);
};

// Get teacher's students with optional batch filter
export const useGetTeacherStudents = (
    batch?: string,
    options?: { skip?: boolean }
) => {
    return useQuery<GetTeacherStudentsResponse, { batch?: string }>(
        GET_TEACHER_STUDENTS,
        {
            variables: batch ? { batch } : {},
            skip: options?.skip
        }
    );
};

// Get teacher's issued credentials with optional subject filter
export const useGetTeacherCredentials = (
    subject?: string,
    options?: { skip?: boolean }
) => {
    return useQuery<GetTeacherCredentialsResponse, { subject?: string }>(
        GET_TEACHER_CREDENTIALS,
        {
            variables: subject ? { subject } : {},
            skip: options?.skip
        }
    );
};

/**
 * Higher-level composite hook for teacher dashboard
 */
export const useTeacherDashboard = () => {
    const { data: courseSetup, loading: loadingSetup, error: errorSetup, refetch: refetchSetup } =
        useGetTeacherCourseSetup();

    const { data: students, loading: loadingStudents, error: errorStudents, refetch: refetchStudents } =
        useGetTeacherStudents();

    const { data: credentials, loading: loadingCredentials, error: errorCredentials, refetch: refetchCredentials } =
        useGetTeacherCredentials();

    return {
        courseSetup: courseSetup?.getTeacherCourseSetup,
        students: students?.getTeacherStudents || [],
        credentials: credentials?.getTeacherCredentials || [],
        loading: loadingSetup || loadingStudents || loadingCredentials,
        error: errorSetup || errorStudents || errorCredentials,
        refetch: () => {
            refetchSetup();
            refetchStudents();
            refetchCredentials();
        }
    };
};

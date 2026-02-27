import { useMutation, useQuery } from '@apollo/client';
import {
    // Mutations
    UPDATE_TEACHER_SUBJECT,
    DELETE_TEACHER_SUBJECT,
    // Queries
    GET_ALL_TEACHER_SUBJECTS,
    GET_TEACHER_SUBJECTS_BY_TEACHER,
    // Types
    UpdateTeacherSubjectInput,
    GetAllTeacherSubjectsResponse,
    GetTeacherSubjectsByTeacherResponse,
    UpdateTeacherSubjectResponse,
    DeleteTeacherSubjectMutationResponse
} from '../gql';

/**
 * Custom hooks for teacher subject operations
 */

// Queries
export const useGetAllTeacherSubjects = () => {
    return useQuery<GetAllTeacherSubjectsResponse>(GET_ALL_TEACHER_SUBJECTS);
};

export const useGetTeacherSubjectsByTeacher = (
    teacherWalletAddress: string,
    options?: { skip?: boolean }
) => {
    return useQuery<GetTeacherSubjectsByTeacherResponse, { teacherWalletAddress: string }>(
        GET_TEACHER_SUBJECTS_BY_TEACHER,
        {
            variables: { teacherWalletAddress },
            skip: !teacherWalletAddress || options?.skip
        }
    );
};

// Mutations
export const useUpdateTeacherSubject = () => {
    return useMutation<UpdateTeacherSubjectResponse, { input: UpdateTeacherSubjectInput }>(
        UPDATE_TEACHER_SUBJECT
    );
};

export const useDeleteTeacherSubject = () => {
    return useMutation<DeleteTeacherSubjectMutationResponse, { subjectId: string }>(
        DELETE_TEACHER_SUBJECT
    );
};

/**
 * Higher-level composite hook for teacher subject management
 */
export const useTeacherSubjects = (teacherWalletAddress?: string) => {
    const { data: allSubjects, loading: loadingAll, error: errorAll, refetch: refetchAll } =
        useGetAllTeacherSubjects();

    const { data: teacherSubjects, loading: loadingTeacher, error: errorTeacher, refetch: refetchTeacher } =
        useGetTeacherSubjectsByTeacher(teacherWalletAddress || '', { skip: !teacherWalletAddress });

    const [updateSubject] = useUpdateTeacherSubject();
    const [deleteSubject] = useDeleteTeacherSubject();

    return {
        allSubjects: allSubjects?.getAllTeacherSubjects || [],
        teacherSubjects: teacherSubjects?.getTeacherSubjectsByTeacher || [],
        loading: loadingAll || loadingTeacher,
        error: errorAll || errorTeacher,
        refetchAll,
        refetchTeacher,
        updateSubject,
        deleteSubject
    };
};

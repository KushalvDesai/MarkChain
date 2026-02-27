import { useMutation, useQuery } from '@apollo/client';
import {
    // Mutations
    CREATE_EXAM_SCHEDULE,
    UPDATE_EXAM_SCHEDULE,
    DELETE_EXAM_SCHEDULE,
    // Queries
    GET_ALL_EXAM_SCHEDULES,
    GET_EXAM_SCHEDULE_BY_ID,
    // Types
    CreateExamScheduleInput,
    UpdateExamScheduleInput,
    GetAllExamSchedulesResponse,
    GetExamScheduleByIdResponse,
    CreateExamScheduleResponse,
    UpdateExamScheduleResponse,
    DeleteExamScheduleMutationResponse
} from '../gql';

/**
 * Custom hooks for exam schedule operations
 */

// Queries
export const useGetAllExamSchedules = () => {
    return useQuery<GetAllExamSchedulesResponse>(GET_ALL_EXAM_SCHEDULES);
};

export const useGetExamScheduleById = (
    examId: string,
    options?: { skip?: boolean }
) => {
    return useQuery<GetExamScheduleByIdResponse, { examId: string }>(
        GET_EXAM_SCHEDULE_BY_ID,
        {
            variables: { examId },
            skip: !examId || options?.skip
        }
    );
};

// Mutations
export const useCreateExamSchedule = () => {
    return useMutation<CreateExamScheduleResponse, { input: CreateExamScheduleInput }>(
        CREATE_EXAM_SCHEDULE
    );
};

export const useUpdateExamSchedule = () => {
    return useMutation<UpdateExamScheduleResponse, { input: UpdateExamScheduleInput }>(
        UPDATE_EXAM_SCHEDULE
    );
};

export const useDeleteExamSchedule = () => {
    return useMutation<DeleteExamScheduleMutationResponse, { examId: string }>(
        DELETE_EXAM_SCHEDULE
    );
};

/**
 * Higher-level composite hook for exam schedule management
 */
export const useExamScheduleManagement = () => {
    const { data, loading, error, refetch } = useGetAllExamSchedules();
    const [createSchedule] = useCreateExamSchedule();
    const [updateSchedule] = useUpdateExamSchedule();
    const [deleteSchedule] = useDeleteExamSchedule();

    return {
        schedules: data?.getAllExamSchedules || [],
        loading,
        error,
        refetch,
        createSchedule,
        updateSchedule,
        deleteSchedule
    };
};

import { useQuery } from '@apollo/client';
import {
    // Queries
    GET_STUDENTS_BY_BATCH,
    // Types
    GetStudentsByBatchResponse
} from '../gql';

/**
 * Custom hooks for student queries
 */

export const useGetStudentsByBatch = (
    batch: string,
    options?: { skip?: boolean }
) => {
    return useQuery<GetStudentsByBatchResponse, { batch: string }>(
        GET_STUDENTS_BY_BATCH,
        {
            variables: { batch },
            skip: !batch || options?.skip
        }
    );
};

/**
 * Higher-level composite hook for student management
 */
export const useStudentManagement = (batch?: string) => {
    const { data, loading, error, refetch } = useGetStudentsByBatch(batch || '', { skip: !batch });

    return {
        students: data?.getStudentsByBatch || [],
        loading,
        error,
        refetch
    };
};

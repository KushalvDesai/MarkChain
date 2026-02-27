import { useMutation, useQuery } from '@apollo/client';
import {
    // Mutations
    CREATE_CREDENTIAL,
    UPDATE_CREDENTIAL_WITH_COMPONENT,
    CREATE_SUBJECT,
    REGISTER_COMPONENT,
    // Queries
    GET_MY_CREDENTIAL,
    GET_STUDENT_CREDENTIAL,
    IS_CREDENTIAL_VALID,
    // Types
    CreateCredentialInput,
    UpdateCredentialWithComponentInput,
    CreateSubjectInput,
    RegisterComponentInput,
    GetStudentCredentialInput,
    IsCredentialValidInput,
    CreateCredentialResponse,
    UpdateCredentialWithComponentResponse,
    CreateSubjectResponse,
    RegisterComponentResponse,
    GetMyCredentialResponse,
    GetStudentCredentialResponse,
    IsCredentialValidResponse
} from '../gql';

/**
 * Custom hooks for credential management operations
 */

// Mutations
export const useCreateCredential = () => {
    return useMutation<CreateCredentialResponse, { input: CreateCredentialInput }>(
        CREATE_CREDENTIAL
    );
};

export const useUpdateCredentialWithComponent = () => {
    return useMutation<UpdateCredentialWithComponentResponse, { input: UpdateCredentialWithComponentInput }>(
        UPDATE_CREDENTIAL_WITH_COMPONENT
    );
};

export const useCreateSubject = () => {
    return useMutation<CreateSubjectResponse, { input: CreateSubjectInput }>(
        CREATE_SUBJECT
    );
};

export const useRegisterComponent = () => {
    return useMutation<RegisterComponentResponse, { input: RegisterComponentInput }>(
        REGISTER_COMPONENT
    );
};

// Queries
export const useGetMyCredential = (
    subject: string,
    options?: { skip?: boolean }
) => {
    return useQuery<GetMyCredentialResponse, { subject: string }>(
        GET_MY_CREDENTIAL,
        {
            variables: { subject },
            skip: !subject || options?.skip
        }
    );
};

export const useGetStudentCredential = (
    input: GetStudentCredentialInput,
    options?: { skip?: boolean }
) => {
    return useQuery<GetStudentCredentialResponse, { input: GetStudentCredentialInput }>(
        GET_STUDENT_CREDENTIAL,
        {
            variables: { input },
            skip: !input.studentAddress || !input.subject || options?.skip
        }
    );
};

export const useIsCredentialValid = (
    input: IsCredentialValidInput,
    options?: { skip?: boolean }
) => {
    return useQuery<IsCredentialValidResponse, { input: IsCredentialValidInput }>(
        IS_CREDENTIAL_VALID,
        {
            variables: { input },
            skip: !input.studentAddress || !input.subject || options?.skip
        }
    );
};

/**
 * Higher-level composite hook for credential management
 */
export const useCredentialOperations = () => {
    const [createCredential] = useCreateCredential();
    const [updateCredential] = useUpdateCredentialWithComponent();
    const [createSubject] = useCreateSubject();
    const [registerComponent] = useRegisterComponent();

    return {
        createCredential,
        updateCredential,
        createSubject,
        registerComponent
    };
};

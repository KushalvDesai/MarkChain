import { useMutation } from '@apollo/client';
import {
    // Mutations
    REVOKE_CREDENTIAL,
    // Types
    RevokeCredentialDatabaseInput,
    RevokeCredentialDatabaseResponse
} from '../gql';

/**
 * Custom hooks for credential operations (database-level)
 */

// Mutations
export const useRevokeCredential = () => {
    return useMutation<RevokeCredentialDatabaseResponse, { input: RevokeCredentialDatabaseInput }>(
        REVOKE_CREDENTIAL
    );
};

/**
 * Higher-level composite hook for credential management
 */
export const useCredentialManagement = () => {
    const [revokeCredential] = useRevokeCredential();

    return {
        revokeCredential
    };
};

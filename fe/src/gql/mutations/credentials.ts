import { gql } from '@apollo/client';

export const REVOKE_CREDENTIAL = gql`
  mutation RevokeCredential($input: RevokeCredentialDatabaseInput!) {
    revokeCredential(input: $input) {
      success
      message
      credentialId
    }
  }
`;

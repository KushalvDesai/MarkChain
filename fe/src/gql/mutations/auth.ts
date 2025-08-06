import { gql } from '@apollo/client';

export const GENERATE_NONCE = gql`
  mutation GenerateNonce($walletAddress: String!) {
    generateNonce(walletAddress: $walletAddress) {
      nonce
      message
    }
  }
`;

export const VERIFY_SIGNATURE = gql`
  mutation VerifySignature($input: VerifySignatureInput!) {
    verifySignature(input: $input) {
      accessToken
      user {
        walletAddress
        did
        role
        name
      }
    }
  }
`;

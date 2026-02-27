# Blockchain Operations Guide

This guide documents all the GraphQL mutations and queries for blockchain operations in the MarkChain application.

## Table of Contents
- [Setup](#setup)
- [Admin Operations](#admin-operations)
- [User Operations](#user-operations)
- [Teacher Operations](#teacher-operations)
- [Student Operations](#student-operations)
- [Public Operations](#public-operations)
- [Utility Operations](#utility-operations)
- [Using Hooks](#using-hooks)
- [Example Usage](#example-usage)

## Setup

All blockchain operations are organized in the `fe/src/gql` folder:
- `mutations/blockchain.ts` - All blockchain mutations
- `queries/blockchain.ts` - All blockchain queries
- `types/index.ts` - TypeScript types and interfaces

Custom hooks are available in:
- `hooks/useBlockchain.ts` - Dedicated blockchain hooks
- `hooks/useGraphQL.ts` - General GraphQL hooks

## Admin Operations

### Assign Blockchain Role
Assigns a blockchain role to a user (e.g., TEACHER_ROLE, STUDENT_ROLE).

```typescript
const [assignRole] = useAssignBlockchainRole();

await assignRole({
  variables: {
    input: {
      userAddress: "0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5",
      role: "TEACHER_ROLE"
    }
  }
});
```

### Assign Subject to Teacher
Assigns a specific subject to a teacher.

```typescript
const [assignSubject] = useAssignSubjectToTeacher();

await assignSubject({
  variables: {
    input: {
      teacherAddress: "0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5",
      subject: "Mathematics"
    }
  }
});
```

### Remove Subject from Teacher
Removes a subject assignment from a teacher.

```typescript
const [removeSubject] = useRemoveSubjectFromTeacher();

await removeSubject({
  variables: {
    input: {
      teacherAddress: "0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5",
      subject: "Mathematics"
    }
  }
});
```

### Revoke Blockchain Credential
Revokes a previously issued credential for a student.

```typescript
const [revokeCredential] = useRevokeBlockchainCredential();

await revokeCredential({
  variables: {
    input: {
      studentAddress: "0x123d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5",
      subject: "Mathematics"
    }
  }
});
```

## User Operations

### Link Wallet Address
Links a wallet address to the current user account.

```typescript
const [linkWallet] = useLinkWalletAddress();

await linkWallet({
  variables: {
    input: {
      walletAddress: "0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5"
    }
  }
});
```

### Register User DID
Registers a Decentralized Identifier (DID) for the user.

```typescript
const [registerDID] = useRegisterUserDID();

await registerDID({
  variables: {
    input: {
      did: "did:ethr:0x742d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5"
    }
  }
});
```

### Get My Blockchain Status
Retrieves the current user's blockchain setup status.

```typescript
const { data, loading, error } = useGetMyBlockchainStatus();

// Or use the composite hook
const { status, isSetupComplete } = useBlockchainSetupStatus();
```

## Teacher Operations

### Issue Blockchain Credential
Issues a new credential for a student in a specific subject.

```typescript
const [issueCredential] = useIssueBlockchainCredential();

const credentialData = JSON.stringify({
  studentName: "John Doe",
  studentId: "23CS001",
  subject: "Mathematics",
  grade: "A+",
  marks: 95,
  semester: "Fall 2023",
  institution: "Charusat University"
});

await issueCredential({
  variables: {
    input: {
      studentAddress: "0x123d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5",
      subject: "Mathematics",
      credentialData: credentialData
    }
  }
});
```

### Get My Assigned Subjects
Retrieves the list of subjects assigned to the current teacher.

```typescript
const { data } = useGetMyAssignedSubjects();
const subjects = data?.getMyAssignedSubjects || [];

// Or use the composite hook
const { subjects } = useTeacherSubjectManagement();
```

## Student Operations

### Get My Subject Credential
Retrieves the credential for a specific subject.

```typescript
const { data } = useGetMySubjectCredential("Mathematics");
const credential = data?.getMySubjectCredential;
```

### Get My Blockchain Credentials
Retrieves all blockchain credentials for the current student.

```typescript
const { data } = useGetMyBlockchainCredentials();
const credentials = data?.getMyBlockchainCredentials || [];

// Or use the composite hook
const { credentials } = useStudentCredentials();
```

## Public Operations

### Verify Blockchain Credential
Verifies a credential for any student (public verification).

```typescript
const { data } = useVerifyBlockchainCredential({
  studentAddress: "0x123d35cc6c6c12a4c3e7e4dae5e5b5b5b5b5b5b5",
  subject: "Mathematics"
});
```

## Utility Operations

### Get Blockchain Network Info
Retrieves information about the blockchain network connection.

```typescript
const { data } = useGetBlockchainNetworkInfo();
const networkInfo = data?.getBlockchainNetworkInfo;
```

### Test IPFS Connection
Tests the connection to the IPFS network.

```typescript
const { data } = useTestIPFSConnection();
const isConnected = data?.testIPFSConnection;
```

## Using Hooks

### Import Hooks
```typescript
// Import specific hooks
import { 
  useAssignBlockchainRole,
  useGetMyBlockchainStatus,
  useIssueBlockchainCredential 
} from '../hooks/useBlockchain';

// Or import all hooks
import * as BlockchainHooks from '../hooks/useBlockchain';
```

### Error Handling
```typescript
const [assignRole, { loading, error }] = useAssignBlockchainRole();

const handleAssignRole = async () => {
  try {
    const result = await assignRole({
      variables: { input: { userAddress, role } }
    });
    
    if (result.data?.assignBlockchainRole.success) {
      console.log('Success:', result.data.assignBlockchainRole.message);
    } else {
      console.error('Error:', result.data?.assignBlockchainRole.error);
    }
  } catch (err) {
    console.error('Network error:', err);
  }
};
```

### Loading States
```typescript
const { data, loading, error, refetch } = useGetMyBlockchainStatus();

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!data) return <div>No data</div>;

return <div>{/* Render data */}</div>;
```

## Example Usage

See `components/BlockchainDemo.tsx` for a complete example demonstrating how to use all blockchain operations.

## Response Types

All mutation operations return a `BlockchainOperationResponse` with the following structure:

```typescript
interface BlockchainOperationResponse {
  success: boolean;
  transactionHash?: string;
  message?: string;
  error?: string;
}
```

Credentials have the following structure:

```typescript
interface BlockchainCredential {
  ipfsHash: string;
  issuer: string;
  updatedAt: string;
  subject: string;
  studentName: string;
  grade: string;
  blockchainTxHash: string;
}
```

## Best Practices

1. **Error Handling**: Always wrap operations in try-catch blocks
2. **Loading States**: Use loading states to provide user feedback
3. **Validation**: Validate wallet addresses and inputs before sending
4. **Refetching**: Use refetch functions to update data after mutations
5. **Composite Hooks**: Use composite hooks for common operations to reduce boilerplate

## Security Notes

- Always validate wallet addresses on both client and server side
- Ensure proper authentication before performing sensitive operations
- Validate credential data before issuing
- Use proper role-based access control for admin operations
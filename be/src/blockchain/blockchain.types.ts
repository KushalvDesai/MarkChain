import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@ObjectType()
export class BlockchainCredential {
  @Field()
  ipfsHash: string;

  @Field()
  issuer: string;

  @Field()
  updatedAt: string;

  @Field({ nullable: true })
  studentName?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  grade?: string;

  @Field({ nullable: true })
  blockchainTxHash?: string;
}

@ObjectType()
export class CredentialData {
  @Field()
  studentName: string;

  @Field()
  studentId: string;

  @Field()
  subject: string;

  @Field()
  grade: string;

  @Field({ nullable: true })
  marks?: number;

  @Field({ nullable: true })
  semester?: string;

  @Field()
  institution: string;

  @Field()
  issueDate: string;

  @Field()
  issuer: string;

  @Field({ nullable: true })
  additionalNotes?: string;
}

@ObjectType()
export class BlockchainUserStatus {
  @Field({ nullable: true })
  walletAddress?: string;

  @Field({ nullable: true })
  didHash?: string;

  @Field({ nullable: true })
  blockchainRole?: string;

  @Field()
  didRegistered: boolean;

  @Field()
  hasBlockchainRole: boolean;

  @Field(() => [String])
  assignedSubjects: string[];
}

@ObjectType()
export class NetworkInfo {
  @Field()
  contractAddress: string;

  @Field()
  walletAddress: string;

  @Field()
  network: string;

  @Field()
  chainId: string;

  @Field()
  isConnected: boolean;
}

@ObjectType()
export class TransactionResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  transactionHash?: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class RoleResponse {
  @Field()
  hasRole: boolean;

  @Field()
  role: string;

  @Field()
  userAddress: string;
}

@ObjectType()
export class DIDResponse {
  @Field({ nullable: true })
  did?: string;

  @Field()
  exists: boolean;

  @Field()
  userAddress: string;
}

@ObjectType()
export class TeacherSubjectsResponse {
  @Field(() => [String])
  subjects: string[];

  @Field()
  teacherAddress: string;
}

// Input Types
@InputType()
export class IssueBlockchainCredentialInput {
  @Field()
  studentAddress: string;

  @Field()
  subject: string;

  @Field()
  credentialData: String; // JSON string of credential data
}

@InputType()
export class RevokeCredentialInput {
  @Field()
  studentAddress: string;

  @Field()
  subject: string;
}

@InputType()
export class AssignRoleInput {
  @Field()
  userAddress: string;

  @Field()
  role: string; // 'TEACHER_ROLE' or 'STUDENT_ROLE'
}

@InputType()
export class SubjectAssignmentInput {
  @Field()
  teacherAddress: string;

  @Field()
  subject: string;
}

@InputType()
export class LinkWalletInput {
  @Field()
  walletAddress: string;
}

@InputType()
export class RegisterDIDInput {
  @Field()
  did: string;
}

@InputType()
export class VerifyCredentialInput {
  @Field()
  studentAddress: string;

  @Field()
  subject: string;
}

// NEW TYPES FOR WEEK 1 APIs
@ObjectType()
export class SubjectResponse {
  @Field()
  _id: string;

  @Field()
  subjectName: string;

  @Field()
  blockchainHash: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  credits?: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class ComponentResponse {
  @Field()
  _id: string;

  @Field()
  componentName: string;

  @Field()
  subjectName: string;

  @Field()
  blockchainHash: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  weightage?: number;

  @Field({ nullable: true })
  maxMarks?: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@InputType()
export class CreateSubjectInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  credits?: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  transactionHash: string;
}

@InputType()
export class RegisterComponentInput {
  @Field()
  subjectName: string;

  @Field()
  componentName: string;

  @Field({ nullable: true })
  weightage?: number;

  @Field({ nullable: true })
  maxMarks?: number;
}

@ObjectType()
export class SubjectWithComponentsResponse {
  @Field()
  txHash: string;

  @Field()
  success: boolean;

  @Field(() => SubjectResponse)
  subject: SubjectResponse;
}

@ObjectType()
export class ComponentWithTxResponse {
  @Field()
  txHash: string;

  @Field()
  success: boolean;

  @Field(() => ComponentResponse)
  component: ComponentResponse;
}

@InputType() 
export class CreateCredentialInput{
  @Field()
  studentAddress: string;

  @Field()
  subjectName: string;

  @Field()
  credentialData: string;

  @Field({nullable : true , defaultValue :31536000 })
  validityPeriod?: number;
}

@ObjectType()
export class CredentialTxResponse {
    @Field()
  success: boolean;

  @Field()
  txHash: string;

  @Field()
  ipfsHash: string;

  @Field({ nullable: true })
  message?: string;

}

@InputType() 
export class gradeComponentInput {
  @Field()
  studentAddress: string;

  @Field()
  subjectName: string;

  @Field()
  componentName: string;

  @Field()
  gradeData: string; // JSON STRING 
}

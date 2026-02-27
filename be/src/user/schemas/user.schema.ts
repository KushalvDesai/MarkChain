import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

// Register enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles in the system',
});

@ObjectType()
export class UserSchema {
  @Field(() => ID)
  id: string;

  @Field()
  walletAddress: string;

  @Field()
  did: string;

  @Field(() => UserRole)
  role: UserRole;

  // Student Name (for all roles, but only editable for students)
  @Field({ nullable: true })
  name?: string;

  // Student ID (required for students)
  @Field({ nullable: true })
  studentId?: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  lastLogin?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // OTP verification fields
  @Field({ nullable: true })
  otp?: string;

  @Field({ nullable: true })
  otpExpiry?: Date;

  @Field({ nullable: true })
  isVerified?: boolean;

  // Blockchain integration fields
  @Field({ nullable: true })
  email?: string; // For traditional login support

  @Field({ nullable: true })
  password?: string; // For traditional login support

  @Field({ nullable: true })
  didHash?: string; // The hashed DID stored on blockchain

  @Field({ nullable: true })
  blockchainRole?: string; // Role assigned on blockchain (TEACHER_ROLE, STUDENT_ROLE)

  @Field({ nullable: true })
  didRegistered?: boolean; // Whether DID is registered on blockchain

  @Field(() => [String], { nullable: true })
  assignedSubjects?: string[]; // Subjects assigned to teachers
}

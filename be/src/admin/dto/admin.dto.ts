import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsEmail, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, Length, Min, Max, Matches, IsDateString, ArrayMinSize } from 'class-validator';

// Assign Blockchain Role DTOs
@InputType()
export class AssignBlockchainRoleInput {
  @Field()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  userWalletAddress: string;

  @Field()
  @IsString()
  @IsEnum(['TEACHER_ROLE', 'STUDENT_ROLE', 'ADMIN_ROLE'], { message: 'Role must be TEACHER_ROLE, STUDENT_ROLE, or ADMIN_ROLE' })
  role: string; // 'TEACHER_ROLE', 'STUDENT_ROLE'
}

@ObjectType()
export class AssignBlockchainRoleResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  txHash?: string;
}

// Teacher Subject Management DTOs
@InputType()
export class CreateTeacherSubjectInput {
  @Field()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  teacherWalletAddress: string;

  @Field()
  @IsString()
  @Length(2, 20, { message: 'Subject code must be between 2 and 20 characters' })
  @Matches(/^[A-Z0-9-]+$/, { message: 'Subject code must be uppercase alphanumeric with hyphens' })
  subjectCode: string;

  @Field()
  @IsString()
  @Length(3, 100, { message: 'Subject name must be between 3 and 100 characters' })
  subjectName: string;

  @Field()
  @IsString()
  @Matches(/^\d{4}-\d{4}$/, { message: 'Academic year must be in format YYYY-YYYY (e.g., 2024-2025)' })
  academicYear: string;

  @Field()
  @IsString()
  @Matches(/^(1|2|3|4|5|6|7|8)$/, { message: 'Semester must be a number between 1 and 8' })
  semester: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one batch must be specified' })
  @IsString({ each: true })
  batches: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  department?: string;
}

@InputType()
export class UpdateTeacherSubjectInput {
  @Field()
  @IsString()
  @Matches(/^[a-f0-9]{24}$/, { message: 'Invalid MongoDB ObjectId' })
  subjectId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Z0-9-]+$/)
  subjectCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  subjectName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{4}$/)
  academicYear?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^(1|2|3|4|5|6|7|8)$/)
  semester?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  batches?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  department?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@ObjectType()
export class TeacherSubjectDto {
  @Field()
  _id: string;

  @Field()
  teacherDID: string;

  @Field()
  teacherWalletAddress: string;

  @Field()
  teacherName: string;

  @Field()
  subjectCode: string;

  @Field()
  subjectName: string;

  @Field()
  academicYear: string;

  @Field()
  semester: string;

  @Field(() => [String])
  batches: string[];

  @Field({ nullable: true })
  department?: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  assignedBy?: string;

  @Field({ nullable: true })
  assignedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Revoke Credential DTOs
@InputType()
export class AdminRevokeCredentialInput {
  @Field()
  @IsString()
  @Matches(/^[a-f0-9]{24}$/, { message: 'Invalid MongoDB ObjectId' })
  credentialId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(5, 500, { message: 'Reason must be between 5 and 500 characters' })
  reason?: string;
}

@ObjectType()
export class AdminRevokeCredentialResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  credentialId?: string;
}

// Exam Schedule DTOs
@InputType()
export class CreateExamScheduleInput {
  @Field()
  @IsString()
  @Length(2, 100)
  subject: string;

  @Field()
  @IsString()
  @Length(3, 100)
  examName: string;

  @Field()
  @IsString()
  @IsEnum(['midterm', 'final', 'quiz', 'assignment', 'practical'], { message: 'Invalid exam type' })
  examType: string;

  @Field()
  @IsDateString({}, { message: 'Invalid date format' })
  examDate: Date;

  @Field()
  @IsNumber()
  @Min(15, { message: 'Duration must be at least 15 minutes' })
  @Max(480, { message: 'Duration cannot exceed 8 hours (480 minutes)' })
  duration: number;

  @Field()
  @IsNumber()
  @Min(1, { message: 'Total marks must be at least 1' })
  @Max(200, { message: 'Total marks cannot exceed 200' })
  totalMarks: number;

  @Field()
  @IsNumber()
  @Min(0, { message: 'Passing marks cannot be negative' })
  passingMarks: number;

  @Field()
  @IsString()
  @Length(2, 100)
  venue: string;

  @Field()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  teacherWalletAddress: string;

  @Field()
  @IsString()
  @Matches(/^\d{4}-\d{4}$/)
  academicYear: string;

  @Field()
  @IsString()
  @Matches(/^(1|2|3|4|5|6|7|8)$/)
  semester: string;

  @Field()
  @IsString()
  @Length(1, 20)
  batch: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  description?: string;
}

@InputType()
export class UpdateExamScheduleInput {
  @Field()
  @IsString()
  @Matches(/^[a-f0-9]{24}$/)
  examId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  subject?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  examName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(['midterm', 'final', 'quiz', 'assignment', 'practical'])
  examType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  examDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  totalMarks?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  passingMarks?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  venue?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  teacherWalletAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(['scheduled', 'ongoing', 'completed', 'cancelled'])
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  description?: string;
}

@ObjectType()
export class ExamScheduleDto {
  @Field()
  _id: string;

  @Field()
  subject: string;

  @Field()
  examName: string;

  @Field()
  examType: string;

  @Field()
  examDate: Date;

  @Field()
  duration: number;

  @Field()
  totalMarks: number;

  @Field()
  passingMarks: number;

  @Field()
  venue: string;

  @Field()
  teacherDID: string;

  @Field()
  academicYear: string;

  @Field()
  semester: string;

  @Field()
  batch: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// View Students by Batch DTOs
@ObjectType()
export class StudentByBatchDto {
  @Field()
  _id: string;

  @Field()
  walletAddress: string;

  @Field()
  did: string;

  @Field()
  name: string;

  @Field()
  studentId: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  batch?: string;
}

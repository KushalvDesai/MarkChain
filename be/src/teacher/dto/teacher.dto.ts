import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, Min, Max, Length, Matches } from 'class-validator';

// Course Setup DTOs
@ObjectType()
export class CourseSetupDto {
  @Field()
  totalSubjects: number;

  @Field()
  totalBatches: number;

  @Field()
  totalStudents: number;

  @Field(() => [SubjectInfoDto])
  subjects: SubjectInfoDto[];
}

@ObjectType()
export class SubjectInfoDto {
  @Field()
  _id: string;

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
}

// Upload Marks (Credential) DTOs
@InputType()
export class UploadMarksInput {
  @Field()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  studentWalletAddress: string;

  @Field()
  @IsString()
  @Length(2, 100, { message: 'Subject must be between 2 and 100 characters' })
  subject: string;

  @Field()
  @IsNumber()
  @Min(0, { message: 'Marks cannot be negative' })
  @Max(100, { message: 'Marks cannot exceed 100' })
  marks: number;

  @Field()
  @IsString()
  @Matches(/^(midterm|final|quiz|assignment|practical)$/, { message: 'Invalid exam type' })
  examType: string;

  @Field()
  @IsString()
  @Matches(/^\d{4}-\d{4}$/, { message: 'Academic year must be in format YYYY-YYYY' })
  academicYear: string;

  @Field()
  @IsString()
  @Matches(/^(1|2|3|4|5|6|7|8)$/, { message: 'Semester must be between 1 and 8' })
  semester: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^(A\+|A|B\+|B|C|D|F)$/, { message: 'Grade must be A+, A, B+, B, C, D, or F' })
  grade?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 200)
  institution?: string;
}

@ObjectType()
export class UploadMarksResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  credentialId?: string;

  @Field({ nullable: true })
  vcHash?: string;
}

// Teacher Students DTOs
@ObjectType()
export class TeacherStudentDto {
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

  @Field({ nullable: true })
  batch?: string;

  @Field()
  isActive: boolean;
}

// Teacher Credentials DTOs
@ObjectType()
export class TeacherCredentialDto {
  @Field()
  _id: string;

  @Field()
  studentDID: string;

  @Field()
  studentName: string;

  @Field()
  subject: string;

  @Field()
  marks: number;

  @Field({ nullable: true })
  grade?: string;

  @Field()
  examType: string;

  @Field()
  academicYear: string;

  @Field()
  semester: string;

  @Field()
  isRevoked: boolean;

  @Field({ nullable: true })
  blockchainTxHash?: string;

  @Field({ nullable: true })
  ipfsHash?: string;

  @Field()
  createdAt: Date;
}

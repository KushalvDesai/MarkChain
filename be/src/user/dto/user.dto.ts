import { InputType, Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../../schemas/user.schema';
import { IsString, IsEmail, Length, Matches, IsOptional } from 'class-validator';

// Register enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles in the system',
});

@ObjectType()
export class UserDto {
  @Field(() => ID)
  _id: string;

  @Field()
  walletAddress: string;

  @Field()
  did: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  name?: string;

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
}

@InputType()
export class UpdateUserProfileDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{5,15}$/, { message: 'Invalid student ID format' })
  studentId?: string;
}

@InputType()
export class SendOTPDto {
  @Field()
  studentId: string;
}

@InputType()
export class VerifyOTPDto {
  @Field()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp: string;

  @Field()
  @IsString()
  @Length(2, 100)
  name: string;

  @Field()
  @IsString()
  @Matches(/^[A-Z0-9]{5,15}$/)
  studentId: string;
}

@ObjectType()
export class OTPResponseDto {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class VerifyOTPResponseDto {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => UserDto, { nullable: true })
  user?: UserDto;
}

// Teacher and Admin Profile Update with Email OTP
@InputType()
export class SendEmailOTPDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z\s]+$/)
  name?: string;
}

@InputType()
export class VerifyEmailOTPDto {
  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field()
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters' })
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z\s]+$/)
  name?: string;
}

@ObjectType()
export class EmailOTPResponseDto {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class VerifyEmailOTPResponseDto {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => UserDto, { nullable: true })
  user?: UserDto;
}

import { InputType, Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../../schemas/user.schema';

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
  name?: string;

  @Field({ nullable: true })
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
  otp: string;

  @Field()
  name: string;

  @Field()
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

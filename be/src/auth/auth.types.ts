import { ObjectType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

// Register the UserRole enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
});

@ObjectType()
export class NonceResponse {
  @Field()
  nonce: string;

  @Field()
  message: string;
}

@ObjectType()
export class UserInfo {
  @Field()
  walletAddress: string;

  @Field()
  did: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => UserInfo)
  user: UserInfo;
}

@InputType()
export class VerifySignatureInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' })
  walletAddress: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]+$/, { message: 'Invalid signature format' })
  signature: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(32, 128, { message: 'Invalid nonce format' })
  nonce: string;
}

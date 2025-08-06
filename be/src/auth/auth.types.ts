import { ObjectType, Field, InputType, registerEnumType } from '@nestjs/graphql';
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
  walletAddress: string;

  @Field()
  signature: string;

  @Field()
  nonce: string;
}

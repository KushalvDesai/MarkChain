import { ObjectType, Field, InputType } from '@nestjs/graphql';

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

  @Field()
  role: string;
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

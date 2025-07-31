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

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  lastLogin?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

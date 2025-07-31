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

@InputType()
export class UpdateUserProfileDto {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];
}

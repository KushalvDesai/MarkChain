import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UpdateUserProfileDto } from './dto/user.dto';
import { UserRole } from '../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(private userService: UserService) {}

  // @Query(() => [UserDto])
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.TEACHER, UserRole.ADMIN)
  // async getAllStudentsWithSubject(
  //   @Args('subject') subject: string,
  // ): Promise<UserDto[]> {
  //   return this.userService.getAllStudentsWithSubject(subject);
  // }

  @Query(() => [UserDto])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsersByRole(
    @Args('role', { type: () => UserRole }) role: UserRole,
  ): Promise<UserDto[]> {
    return this.userService.getUsersByRole(role);
  }

  @Query(() => UserDto)
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @Args('walletAddress') walletAddress: string,
  ): Promise<UserDto> {
    return this.userService.getUserProfile(walletAddress);
  }

  @Query(() => [UserDto])
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(): Promise<UserDto[]> {
    return this.userService.getAllUsers();
  }

  @Mutation(() => UserDto)
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Args('walletAddress') walletAddress: string,
    @Args('input') input: UpdateUserProfileDto,
  ): Promise<UserDto> {
    return this.userService.updateUserProfile(walletAddress, input);
  }
}

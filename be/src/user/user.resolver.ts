import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { 
  UserDto, 
  UpdateUserProfileDto, 
  SendOTPDto, 
  VerifyOTPDto, 
  OTPResponseDto, 
  VerifyOTPResponseDto,
  SendEmailOTPDto,
  VerifyEmailOTPDto,
  EmailOTPResponseDto,
  VerifyEmailOTPResponseDto
} from './dto/user.dto';
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
    @Args('input') input: UpdateUserProfileDto,
    @Context() context: any,
  ): Promise<UserDto> {
    const walletAddress = context.req.user.walletAddress;
    return this.userService.updateUserProfile(walletAddress, input);
  }

  @Mutation(() => OTPResponseDto)
  @UseGuards(JwtAuthGuard)
  async sendOTPForVerification(
    @Args('input') input: SendOTPDto,
    @Context() context: any,
  ): Promise<OTPResponseDto> {
    const walletAddress = context.req.user.walletAddress;
    return this.userService.sendOTPForVerification(walletAddress, input.studentId);
  }

  @Mutation(() => VerifyOTPResponseDto)
  @UseGuards(JwtAuthGuard)
  async verifyOTPAndUpdateProfile(
    @Args('input') input: VerifyOTPDto,
    @Context() context: any,
  ): Promise<VerifyOTPResponseDto> {
    const walletAddress = context.req.user.walletAddress;
    const updateData = {
      name: input.name,
      studentId: input.studentId
    };
    return this.userService.verifyOTPAndUpdateProfile(walletAddress, input.otp, updateData);
  }

  // Email OTP for Teachers and Admins
  @Mutation(() => EmailOTPResponseDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async sendEmailOTPForProfile(
    @Args('input') input: SendEmailOTPDto,
    @Context() context: any,
  ): Promise<EmailOTPResponseDto> {
    const walletAddress = context.req.user.walletAddress;
    return this.userService.sendEmailOTPForProfile(walletAddress, input.email, input.name);
  }

  @Mutation(() => VerifyEmailOTPResponseDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async verifyEmailOTPAndUpdateProfile(
    @Args('input') input: VerifyEmailOTPDto,
    @Context() context: any,
  ): Promise<VerifyEmailOTPResponseDto> {
    const walletAddress = context.req.user.walletAddress;
    return this.userService.verifyEmailOTPAndUpdateProfile(
      walletAddress,
      input.email,
      input.otp,
      input.name
    );
  }
}

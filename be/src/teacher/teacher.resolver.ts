import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import {
  CourseSetupDto,
  TeacherStudentDto,
  TeacherCredentialDto,
  UploadMarksInput,
  UploadMarksResponse,
} from './dto/teacher.dto';

@Resolver()
export class TeacherResolver {
  constructor(private teacherService: TeacherService) {}

  // Teacher Dashboard - Course Setup
  @Query(() => CourseSetupDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getTeacherCourseSetup(
    @Context() context: any,
  ): Promise<CourseSetupDto> {
    const teacherWalletAddress = context.req.user.walletAddress;
    return this.teacherService.getCourseSetup(teacherWalletAddress);
  }

  // Teacher Dashboard - Students Page
  @Query(() => [TeacherStudentDto])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getTeacherStudents(
    @Context() context: any,
    @Args('batch', { nullable: true }) batch?: string,
  ): Promise<TeacherStudentDto[]> {
    const teacherWalletAddress = context.req.user.walletAddress;
    return this.teacherService.getTeacherStudents(teacherWalletAddress, batch);
  }

  // Teacher Dashboard - Credentials Page
  @Query(() => [TeacherCredentialDto])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getTeacherCredentials(
    @Context() context: any,
    @Args('subject', { nullable: true }) subject?: string,
  ): Promise<TeacherCredentialDto[]> {
    const teacherWalletAddress = context.req.user.walletAddress;
    return this.teacherService.getTeacherCredentials(teacherWalletAddress, subject);
  }

  // Upload Marks (Create Credential)
  @Mutation(() => UploadMarksResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async uploadMarks(
    @Args('input') input: UploadMarksInput,
    @Context() context: any,
  ): Promise<UploadMarksResponse> {
    const teacherWalletAddress = context.req.user.walletAddress;
    return this.teacherService.uploadMarks(input, teacherWalletAddress);
  }
}

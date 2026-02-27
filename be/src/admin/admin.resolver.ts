import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import {
  AssignBlockchainRoleInput,
  AssignBlockchainRoleResponse,
  CreateTeacherSubjectInput,
  UpdateTeacherSubjectInput,
  TeacherSubjectDto,
  AdminRevokeCredentialInput,
  AdminRevokeCredentialResponse,
  CreateExamScheduleInput,
  UpdateExamScheduleInput,
  ExamScheduleDto,
  StudentByBatchDto,
} from './dto/admin.dto';

@Resolver()
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  // Assign Blockchain Role
  @Mutation(() => AssignBlockchainRoleResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignBlockchainRole(
    @Args('input') input: AssignBlockchainRoleInput,
    @Context() context: any,
  ): Promise<AssignBlockchainRoleResponse> {
    const adminDID = context.req.user.did;
    return this.adminService.assignBlockchainRole(input, adminDID);
  }

  // Teacher Subject Management
  @Mutation(() => TeacherSubjectDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTeacherSubject(
    @Args('input') input: CreateTeacherSubjectInput,
    @Context() context: any,
  ): Promise<TeacherSubjectDto> {
    const adminDID = context.req.user.did;
    return this.adminService.createTeacherSubject(input, adminDID);
  }

  @Query(() => [TeacherSubjectDto])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllTeacherSubjects(): Promise<TeacherSubjectDto[]> {
    return this.adminService.getAllTeacherSubjects();
  }

  @Query(() => [TeacherSubjectDto])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getTeacherSubjectsByTeacher(
    @Args('teacherWalletAddress') teacherWalletAddress: string,
  ): Promise<TeacherSubjectDto[]> {
    return this.adminService.getTeacherSubjectsByTeacher(teacherWalletAddress);
  }

  @Mutation(() => TeacherSubjectDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTeacherSubject(
    @Args('input') input: UpdateTeacherSubjectInput,
  ): Promise<TeacherSubjectDto> {
    return this.adminService.updateTeacherSubject(input);
  }

  @Mutation(() => AssignBlockchainRoleResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTeacherSubject(
    @Args('subjectId') subjectId: string,
  ): Promise<any> {
    return this.adminService.deleteTeacherSubject(subjectId);
  }

  // Revoke Credential
  @Mutation(() => AdminRevokeCredentialResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async revokeCredential(
    @Args('input') input: AdminRevokeCredentialInput,
    @Context() context: any,
  ): Promise<AdminRevokeCredentialResponse> {
    const adminDID = context.req.user.did;
    return this.adminService.revokeCredential(input, adminDID);
  }

  // Exam Schedule CRUD
  @Mutation(() => ExamScheduleDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createExamSchedule(
    @Args('input') input: CreateExamScheduleInput,
    @Context() context: any,
  ): Promise<ExamScheduleDto> {
    const adminDID = context.req.user.did;
    return this.adminService.createExamSchedule(input, adminDID);
  }

  @Query(() => [ExamScheduleDto])
  @UseGuards(JwtAuthGuard)
  async getAllExamSchedules(): Promise<ExamScheduleDto[]> {
    return this.adminService.getAllExamSchedules();
  }

  @Query(() => ExamScheduleDto)
  @UseGuards(JwtAuthGuard)
  async getExamScheduleById(
    @Args('examId') examId: string,
  ): Promise<ExamScheduleDto> {
    return this.adminService.getExamScheduleById(examId);
  }

  @Mutation(() => ExamScheduleDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateExamSchedule(
    @Args('input') input: UpdateExamScheduleInput,
  ): Promise<ExamScheduleDto> {
    return this.adminService.updateExamSchedule(input);
  }

  @Mutation(() => AssignBlockchainRoleResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteExamSchedule(
    @Args('examId') examId: string,
  ): Promise<any> {
    return this.adminService.deleteExamSchedule(examId);
  }

  // View Students by Batch
  @Query(() => [StudentByBatchDto])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStudentsByBatch(
    @Args('batch') batch: string,
  ): Promise<StudentByBatchDto[]> {
    return this.adminService.getStudentsByBatch(batch);
  }
}

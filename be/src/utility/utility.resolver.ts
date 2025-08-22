import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UtilityService } from './utility.service';
import {
  HealthCheckResponse,
  SystemInfoResponse,
  HashDataDto,
  HashResponse,
  ValidateDIDDto,
  ValidateDIDResponse,
} from './dto/utility.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@Resolver()
export class UtilityResolver {
  constructor(private readonly utilityService: UtilityService) {}

  // 1. Health Check API (Public - no authentication required)
  @Query(() => HealthCheckResponse)
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.utilityService.healthCheck();
  }

  // 2. System Information API (Admin only)
  @Query(() => SystemInfoResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSystemInfo(): Promise<SystemInfoResponse> {
    return this.utilityService.getSystemInfo();
  }

  // 3. Hash Data API (All authenticated users)
  @Mutation(() => HashResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async hashData(@Args('hashDataDto') hashDataDto: HashDataDto): Promise<HashResponse> {
    return this.utilityService.hashData(hashDataDto);
  }

  // 4. Validate DID API (All authenticated users)
  @Query(() => ValidateDIDResponse)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async validateDID(@Args('validateDIDDto') validateDIDDto: ValidateDIDDto): Promise<ValidateDIDResponse> {
    return this.utilityService.validateDID(validateDIDDto);
  }

  // Additional utility endpoints
  @Query(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async generateNonce(): Promise<string> {
    const result = await this.utilityService.generateNonce();
    return JSON.stringify(result);
  }

  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async validateTimestamp(
    @Args('timestamp') timestamp: number,
    @Args('maxAgeMs', { defaultValue: 300000 }) maxAgeMs: number,
  ): Promise<boolean> {
    return this.utilityService.validateTimestamp(timestamp, maxAgeMs);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async sanitizeString(@Args('input') input: string): Promise<string> {
    return this.utilityService.sanitizeString(input);
  }
}

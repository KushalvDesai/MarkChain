import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

// Health Check DTOs
@ObjectType()
export class HealthCheckResponse {
  @Field()
  status: string;

  @Field()
  timestamp: string;

  @Field()
  uptime: number;

  @Field()
  version: string;

  @Field()
  environment: string;
}

// System Info DTOs
@ObjectType()
export class SystemInfoResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  nodeVersion: string;

  @Field()
  platform: string;

  @Field()
  architecture: string;

  @Field()
  totalMemory: string;

  @Field()
  freeMemory: string;

  @Field()
  uptime: number;
}

// Hash Utility DTOs
@InputType()
export class HashDataDto {
  @Field()
  @IsString()
  data: string;

  @Field({ defaultValue: 'sha256' })
  @IsOptional()
  @IsString()
  algorithm?: string;
}

@ObjectType()
export class HashResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  hash: string;

  @Field()
  algorithm: string;

  @Field()
  originalData: string;
}

// Validate DID DTOs
@InputType()
export class ValidateDIDDto {
  @Field()
  @IsString()
  did: string;
}

@ObjectType()
export class ValidateDIDResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  isValid: boolean;

  @Field()
  did: string;

  @Field({ nullable: true })
  method?: string;

  @Field({ nullable: true })
  network?: string;
}

import { Module } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityResolver } from './utility.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [UtilityService, UtilityResolver],
  exports: [UtilityService],
})
export class UtilityModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../schemas/user.schema';
import { TeacherSubject, TeacherSubjectSchema } from '../schemas/teacher-subject.schema';
import { ExamSchedule, ExamScheduleSchema } from '../schemas/exam-schedule.schema';
import { Credential, CredentialSchema } from '../schemas/credential.schema';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TeacherSubject.name, schema: TeacherSubjectSchema },
      { name: ExamSchedule.name, schema: ExamScheduleSchema },
      { name: Credential.name, schema: CredentialSchema },
    ]),
    BlockchainModule,
    NotificationModule,
  ],
  providers: [AdminResolver, AdminService],
  exports: [AdminService],
})
export class AdminModule {}

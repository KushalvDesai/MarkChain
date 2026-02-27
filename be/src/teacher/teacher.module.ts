import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherResolver } from './teacher.resolver';
import { TeacherService } from './teacher.service';
import { User, UserSchema } from '../schemas/user.schema';
import { TeacherSubject, TeacherSubjectSchema } from '../schemas/teacher-subject.schema';
import { Credential, CredentialSchema } from '../schemas/credential.schema';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TeacherSubject.name, schema: TeacherSubjectSchema },
      { name: Credential.name, schema: CredentialSchema },
    ]),
    BlockchainModule,
    NotificationModule,
  ],
  providers: [TeacherResolver, TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}

import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockchainService } from './blockchain.service';
import { BlockchainResolver } from './blockchain.resolver';
import { IPFSService } from './ipfs.service';
import { UserModule } from '../user/user.module';
import { Subject, SubjectSchema } from '../schemas/subject.schema';
import { Component, ComponentSchema } from '../schemas/component.schema';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: Component.name, schema: ComponentSchema }
    ])
  ],
  providers: [
    BlockchainService, 
    BlockchainResolver, 
    IPFSService
  ],
  exports: [
    BlockchainService, 
    IPFSService
  ],
})
export class BlockchainModule {}
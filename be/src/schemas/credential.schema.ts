import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CredentialDocument = Credential & Document;

@Schema({ timestamps: true })
export class Credential {
  @Prop({ required: true })
  studentDID: string;

  @Prop({ required: true })
  teacherDID: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, min: 0, max: 100 })
  marks: number;

  @Prop({ required: true })
  vcHash: string; // SHA256 hash of the VC JSON

  @Prop({ required: true, type: Object })
  vcJson: any; // Complete Verifiable Credential JSON

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokedBy?: string;

  @Prop()
  blockchainTxHash?: string; // Transaction hash when anchored on blockchain

  @Prop()
  academicYear?: string;

  @Prop()
  semester?: string;

  @Prop()
  examType?: string; // 'midterm', 'final', 'assignment', etc.
}

export const CredentialSchema = SchemaFactory.createForClass(Credential);

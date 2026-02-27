import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subject {
  @Prop({ required: true, unique: true })
  subjectName: string;

  @Prop({ required: true })
  blockchainHash: string; // Transaction hash from blockchain

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy: string; // Admin who created it

  @Prop()
  description: string;

  @Prop()
  credits: number; // Credit hours for the subject

  createdAt: Date;
  updatedAt: Date;
}

export type SubjectDocument = Subject & Document;
export const SubjectSchema = SchemaFactory.createForClass(Subject);

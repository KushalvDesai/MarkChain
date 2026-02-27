import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeacherSubjectDocument = TeacherSubject & Document;

@Schema({ timestamps: true })
export class TeacherSubject {
  @Prop({ required: true })
  teacherDID: string;

  @Prop({ required: true })
  teacherWalletAddress: string;

  @Prop({ required: true })
  teacherName: string;

  @Prop({ required: true })
  subjectCode: string;

  @Prop({ required: true })
  subjectName: string;

  @Prop()
  academicYear: string;

  @Prop()
  semester: string;

  @Prop([String])
  batches: string[]; // List of batches assigned for this subject

  @Prop()
  department: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  assignedBy: string; // Admin DID who assigned this subject

  @Prop()
  assignedAt: Date;
}

export const TeacherSubjectSchema = SchemaFactory.createForClass(TeacherSubject);

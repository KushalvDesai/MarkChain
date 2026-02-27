import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamScheduleDocument = ExamSchedule & Document;

@Schema({ timestamps: true })
export class ExamSchedule {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  examName: string;

  @Prop({ required: true })
  examType: string; // 'midterm', 'final', 'assignment', 'quiz'

  @Prop({ required: true })
  examDate: Date;

  @Prop()
  duration: number; // in minutes

  @Prop()
  totalMarks: number;

  @Prop()
  passingMarks: number;

  @Prop()
  venue: string;

  @Prop()
  teacherDID: string;

  @Prop()
  academicYear: string;

  @Prop()
  semester: string;

  @Prop()
  batch: string;

  @Prop({ default: 'scheduled' })
  status: string; // 'scheduled', 'ongoing', 'completed', 'cancelled'

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ExamScheduleSchema = SchemaFactory.createForClass(ExamSchedule);

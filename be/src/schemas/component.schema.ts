import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Component {
  @Prop({ required: true })
  componentName: string;

  @Prop({ required: true })
  subjectName: string;

  @Prop({ required: true })
  blockchainHash: string; // Transaction hash from blockchain

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy: string; // Admin who created it

  @Prop()
  weightage: number; // Optional weightage for grading

  @Prop()
  maxMarks: number; // Optional max marks

  createdAt: Date;
  updatedAt: Date;
}

export type ComponentDocument = Component & Document;
export const ComponentSchema = SchemaFactory.createForClass(Component);

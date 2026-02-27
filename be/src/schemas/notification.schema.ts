import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  recipientDID: string;

  @Prop({ required: true })
  recipientWalletAddress: string;

  @Prop({ required: true })
  type: string; // 'credential_issued', 'credential_revoked', 'exam_scheduled', 'marks_uploaded', 'profile_updated', 'subject_assigned'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  metadata: any; // Additional data related to the notification

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt: Date;

  @Prop()
  senderDID: string;

  @Prop()
  senderWalletAddress: string;

  @Prop()
  relatedEntityId: string; // ID of related credential, exam, etc.

  @Prop()
  relatedEntityType: string; // 'credential', 'exam', 'subject'
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

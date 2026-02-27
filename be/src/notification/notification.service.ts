import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Create a new notification
  async createNotification(data: {
    recipientDID: string;
    recipientWalletAddress: string;
    type: string;
    title: string;
    message: string;
    senderDID?: string;
    senderWalletAddress?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    metadata?: any;
  }): Promise<any> {
    // If wallet address not provided, fetch from DID
    let walletAddress = data.recipientWalletAddress;
    if (!walletAddress || walletAddress === '') {
      const user = await this.userModel.findOne({ did: data.recipientDID });
      if (user) {
        walletAddress = user.walletAddress;
      }
    }

    const notification = new this.notificationModel({
      recipientDID: data.recipientDID,
      recipientWalletAddress: walletAddress,
      type: data.type,
      title: data.title,
      message: data.message,
      senderDID: data.senderDID,
      senderWalletAddress: data.senderWalletAddress,
      relatedEntityId: data.relatedEntityId,
      relatedEntityType: data.relatedEntityType,
      metadata: data.metadata,
    });

    return notification.save();
  }

  // Get notifications for a user
  async getNotificationsForUser(walletAddress: string, limit?: number): Promise<any[]> {
    const query = this.notificationModel.find({
      recipientWalletAddress: walletAddress.toLowerCase(),
    })
    .sort({ createdAt: -1 });

    if (limit) {
      query.limit(limit);
    }

    return query.exec();
  }

  // Get unread notifications count
  async getUnreadCount(walletAddress: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientWalletAddress: walletAddress.toLowerCase(),
      isRead: false,
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string, walletAddress: string): Promise<any> {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      recipientWalletAddress: walletAddress.toLowerCase(),
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  // Mark all notifications as read
  async markAllAsRead(walletAddress: string): Promise<any> {
    await this.notificationModel.updateMany(
      {
        recipientWalletAddress: walletAddress.toLowerCase(),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  // Delete notification
  async deleteNotification(notificationId: string, walletAddress: string): Promise<any> {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      recipientWalletAddress: walletAddress.toLowerCase(),
    });

    if (result.deletedCount === 0) {
      throw new Error('Notification not found');
    }

    return {
      success: true,
      message: 'Notification deleted',
    };
  }
}

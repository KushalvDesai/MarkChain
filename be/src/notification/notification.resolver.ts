import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  NotificationDto,
  MarkNotificationReadInput,
  MarkNotificationReadResponse,
} from './dto/notification.dto';

@Resolver()
export class NotificationResolver {
  constructor(private notificationService: NotificationService) {}

  // Get notifications for logged-in user
  @Query(() => [NotificationDto])
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(
    @Context() context: any,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<NotificationDto[]> {
    const walletAddress = context.req.user.walletAddress;
    return this.notificationService.getNotificationsForUser(walletAddress, limit);
  }

  // Get unread notifications count
  @Query(() => Int)
  @UseGuards(JwtAuthGuard)
  async getUnreadNotificationsCount(
    @Context() context: any,
  ): Promise<number> {
    const walletAddress = context.req.user.walletAddress;
    return this.notificationService.getUnreadCount(walletAddress);
  }

  // Mark notification as read
  @Mutation(() => MarkNotificationReadResponse)
  @UseGuards(JwtAuthGuard)
  async markNotificationAsRead(
    @Args('input') input: MarkNotificationReadInput,
    @Context() context: any,
  ): Promise<MarkNotificationReadResponse> {
    const walletAddress = context.req.user.walletAddress;
    return this.notificationService.markAsRead(input.notificationId, walletAddress);
  }

  // Mark all notifications as read
  @Mutation(() => MarkNotificationReadResponse)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(
    @Context() context: any,
  ): Promise<MarkNotificationReadResponse> {
    const walletAddress = context.req.user.walletAddress;
    return this.notificationService.markAllAsRead(walletAddress);
  }

  // Delete notification
  @Mutation(() => MarkNotificationReadResponse)
  @UseGuards(JwtAuthGuard)
  async deleteNotification(
    @Args('notificationId') notificationId: string,
    @Context() context: any,
  ): Promise<MarkNotificationReadResponse> {
    const walletAddress = context.req.user.walletAddress;
    return this.notificationService.deleteNotification(notificationId, walletAddress);
  }
}

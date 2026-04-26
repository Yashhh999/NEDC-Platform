import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubscriptionPlan } from '@prisma/client';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('my')
  getMySubscription(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.getMySubscription(user.id);
  }

  @Post()
  subscribe(
    @CurrentUser() user: { id: string },
    @Body('plan') plan: SubscriptionPlan,
  ) {
    return this.subscriptionsService.subscribe(user.id, plan);
  }

  @Delete()
  cancel(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.cancel(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.subscriptionsService.findAll();
  }
}

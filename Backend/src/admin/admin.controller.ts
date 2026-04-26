import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('payments')
  getAllPayments(@Query('status') status?: string) {
    return this.adminService.getAllPayments(status);
  }

  @Get('enrollments')
  getAllEnrollments() {
    return this.adminService.getAllEnrollments();
  }

  @Get('recent')
  getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(limit ? parseInt(limit) : 10);
  }
}

import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { InquiryStatus } from '@prisma/client';

@Controller('inquiries')
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  // Public: submit a contact/inquiry form (rate limited: 3/min)
  @Post()
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  // Admin: view all leads
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query('status') status?: InquiryStatus) {
    return this.inquiriesService.findAll(status);
  }

  // Admin: update lead status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: InquiryStatus) {
    return this.inquiriesService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}

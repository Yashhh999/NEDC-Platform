import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.enroll(user.id, dto);
  }

  @Get('my')
  getMyEnrollments(
    @CurrentUser() user: { id: string; email: string; role: string },
  ) {
    return this.enrollmentsService.getMyEnrollments(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAllEnrollments() {
    return this.enrollmentsService.getAllEnrollments();
  }
}

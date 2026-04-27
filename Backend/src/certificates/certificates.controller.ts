import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get('my')
  getUserCertificates(@CurrentUser() user: { id: string }) {
    return this.certificatesService.getUserCertificates(user.id);
  }

  @Post(':courseId')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  issueCertificate(
    @CurrentUser() user: { id: string },
    @Param('courseId') courseId: string,
  ) {
    return this.certificatesService.issueCertificate(user.id, courseId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAllCertificates() {
    return this.certificatesService.getAllCertificates();
  }
}

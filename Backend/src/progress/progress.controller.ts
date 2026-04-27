import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('lesson/:lessonId/complete')
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  markComplete(
    @CurrentUser() user: { id: string },
    @Param('lessonId') lessonId: string,
  ) {
    return this.progressService.markLessonComplete(user.id, lessonId);
  }

  @Get('course/:courseId')
  getCourseProgress(
    @CurrentUser() user: { id: string },
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCourseProgress(user.id, courseId);
  }

  @Get()
  getUserProgress(@CurrentUser() user: { id: string }) {
    return this.progressService.getUserProgress(user.id);
  }
}

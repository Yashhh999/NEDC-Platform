import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('homepage')
  getHomepageData() {
    return this.coursesService.getHomepageData();
  }

  @Get()
  findPublished() {
    return this.coursesService.findPublished();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOneAdmin(@Param('id') id: string) {
    return this.coursesService.findOneAdmin(id);
  }

  // Authenticated, enrolled (or admin) — full lesson content/videoUrl.
  @Get(':id/learn')
  @UseGuards(JwtAuthGuard)
  findOneEnrolled(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Param('id') id: string,
  ) {
    return this.coursesService.findOneEnrolled(id, user);
  }

  // Public — no lesson content or video URLs.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post('modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createModule(@Body() dto: CreateModuleDto) {
    return this.coursesService.createModule(dto);
  }

  @Patch('modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateModule(
    @Param('id') id: string,
    @Body() data: { title?: string; order?: number },
  ) {
    return this.coursesService.updateModule(id, data);
  }

  @Delete('modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteModule(@Param('id') id: string) {
    return this.coursesService.deleteModule(id);
  }

  @Post('lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createLesson(@Body() dto: CreateLessonDto) {
    return this.coursesService.createLesson(dto);
  }

  @Patch('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateLesson(@Param('id') id: string, @Body() data: UpdateLessonDto) {
    return this.coursesService.updateLesson(id, data);
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteLesson(@Param('id') id: string) {
    return this.coursesService.deleteLesson(id);
  }
}

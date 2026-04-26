import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ─── Dashboard: Own profile ───────────────────────────
  @Get('profile')
  getProfile(
    @CurrentUser() user: { id: string; email: string; role: string },
  ) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() data: { email?: string },
  ) {
    return this.usersService.updateProfile(user.id, data);
  }

  // ─── Admin: All users ─────────────────────────────────
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() data: { email?: string; role?: string },
  ) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get()
  async findAll(@Query('role') role?: string): Promise<User[]> {
    if (role) {
      return this.userService.findByRole(role);
    }
    return this.userService.findAll();
  }
}

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TBaseDTO } from '../auth/dto/base-response.dto';

/**
 * Controller for user-related endpoints
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get user profile (protected endpoint)
   * @param req - Request object with user from JWT guard
   * @returns User profile information
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<TBaseDTO<any>> {
    try {
      const user = await this.userService.findById(req.user.id);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        message: 'Profile retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to retrieve profile',
      };
    }
  }
}


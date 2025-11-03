import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TBaseDTO } from './dto/base-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Controller for authentication endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint
   * @param loginDto - Login credentials
   * @returns Authentication response with tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<TBaseDTO<AuthResponseDto>> {
    try {
      const data = await this.authService.login(loginDto);
      return {
        success: true,
        data,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Refresh token endpoint
   * @param refreshTokenDto - Refresh token
   * @returns New authentication response with tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TBaseDTO<AuthResponseDto>> {
    try {
      const data = await this.authService.refreshToken(
        refreshTokenDto.refreshToken,
      );
      return {
        success: true,
        data,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Token refresh failed',
      };
    }
  }

  /**
   * Logout endpoint
   * @param refreshTokenDto - Refresh token to invalidate
   * @returns Success response
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TBaseDTO<void>> {
    try {
      await this.authService.logout(refreshTokenDto.refreshToken);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  }

  /**
   * Get current user endpoint (protected)
   * @param req - Request object with user from JWT guard
   * @returns Current user information
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any): Promise<TBaseDTO<any>> {
    try {
      const user = req.user;
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        message: 'User retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to retrieve user',
      };
    }
  }
}


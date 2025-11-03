import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserService } from '../user/user.service';
import { RefreshToken } from './refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

/**
 * Constants for token expiration
 */
const ACCESS_TOKEN_EXPIRATION = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRATION_DAYS = 7; // 7 days

/**
 * Service for authentication operations
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * Validate user credentials and generate tokens
   * @param loginDto - Login credentials
   * @returns Authentication response with tokens and user data
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Save refresh token to database
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   * @param refreshTokenString - Refresh token string
   * @returns New authentication response with tokens
   */
  async refreshToken(
    refreshTokenString: string,
  ): Promise<AuthResponseDto> {
    // Verify refresh token
    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(refreshTokenString, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if token exists in database
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenString },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const user = refreshToken.user;
    const newAccessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user);

    // Delete old refresh token and save new one
    await this.refreshTokenRepository.delete({ id: refreshToken.id });
    await this.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Logout user by invalidating refresh token
   * @param refreshTokenString - Refresh token string to invalidate
   */
  async logout(refreshTokenString: string): Promise<void> {
    if (!refreshTokenString) {
      throw new BadRequestException('Refresh token is required');
    }

    await this.refreshTokenRepository.delete({ token: refreshTokenString });
  }

  /**
   * Generate access token for user
   * @param user - User entity
   * @returns JWT access token
   */
  private async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'secret-key',
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
  }

  /**
   * Generate refresh token for user
   * @param user - User entity
   * @returns JWT refresh token
   */
  private async generateRefreshToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      expiresIn: `${REFRESH_TOKEN_EXPIRATION_DAYS}d`,
    });
  }

  /**
   * Save refresh token to database
   * @param userId - User ID
   * @param token - Refresh token string
   */
  private async saveRefreshToken(userId: number, token: string): Promise<void> {
    const decoded: any = await this.jwtService.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Clean up expired tokens
    await this.cleanupExpiredTokens();
  }

  /**
   * Clean up expired refresh tokens from database
   */
  private async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * Validate access token and return user
   * @param token - Access token string
   * @returns User entity
   */
  async validateAccessToken(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'secret-key',
      });

      if (decoded.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}


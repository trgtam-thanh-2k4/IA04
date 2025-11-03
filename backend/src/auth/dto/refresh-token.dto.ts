import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for refresh token request
 */
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}


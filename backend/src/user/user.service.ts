import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

/**
 * Service for user-related operations
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find a user by email
   * @param email - User email address
   * @returns User entity or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by ID
   * @param id - User ID
   * @returns User entity or null
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Create a new user
   * @param email - User email address
   * @param password - User password (will be hashed)
   * @param name - User name
   * @returns Created user entity
   */
  async create(email: string, password: string, name?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
    });
    return this.userRepository.save(user);
  }

  /**
   * Validate user password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns True if password matches, false otherwise
   */
  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}


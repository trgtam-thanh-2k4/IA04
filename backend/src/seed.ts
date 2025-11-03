import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';

/**
 * Seed script to create a test user
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  // Check if user already exists
  const existingUser = await userService.findByEmail(testEmail);

  if (existingUser) {
    console.log('Test user already exists');
  } else {
    await userService.create(testEmail, testPassword, 'Test User');
    console.log('Test user created successfully!');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
  }

  await app.close();
}

bootstrap();


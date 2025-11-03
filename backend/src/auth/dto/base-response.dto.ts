/**
 * Base response DTO with standard structure
 */
export class TBaseDTO<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


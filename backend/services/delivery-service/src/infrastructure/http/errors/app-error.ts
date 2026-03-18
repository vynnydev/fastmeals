export interface ErrorDetail {
    field: string;
    message: string;
  }
  
  export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details: ErrorDetail[];
  
    constructor(statusCode: number, code: string, message: string, details: ErrorDetail[] = []) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.details = details;
      Object.setPrototypeOf(this, AppError.prototype);
    }
  
    static badRequest(code: string, message: string, details: ErrorDetail[] = []): AppError {
      return new AppError(400, code, message, details);
    }
  
    static unauthorized(code: string, message: string): AppError {
      return new AppError(401, code, message);
    }
  
    static forbidden(message: string = 'Permissão insuficiente para a ação'): AppError {
      return new AppError(403, 'FORBIDDEN', message);
    }
  
    static notFound(code: string, message: string): AppError {
      return new AppError(404, code, message);
    }
  
    static conflict(code: string, message: string): AppError {
      return new AppError(409, code, message);
    }
  
    static unprocessable(code: string, message: string, details: ErrorDetail[] = []): AppError {
      return new AppError(422, code, message, details);
    }
  
    static tooManyRequests(message: string = 'Limite de requisições atingido'): AppError {
      return new AppError(429, 'RATE_LIMIT_EXCEEDED', message);
    }
  
    static internal(message: string = 'Erro interno do servidor'): AppError {
      return new AppError(500, 'INTERNAL_ERROR', message);
    }
  
    toJSON(): Record<string, unknown> {
      return {
        error: {
          code: this.code,
          message: this.message,
          ...(this.details.length > 0 && { details: this.details }),
        },
      };
    }
  }
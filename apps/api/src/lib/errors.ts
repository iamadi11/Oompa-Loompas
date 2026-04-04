import type { FastifyReply } from 'fastify'
import type { ApiError } from '@oompa/types'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly error: string,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, 'Not Found', `${resource} with id '${id}' not found`)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'Validation Error', message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'Conflict', message)
  }
}

export function sendError(reply: FastifyReply, error: AppError): void {
  const body: ApiError = {
    error: error.error,
    message: error.message,
    statusCode: error.statusCode,
  }
  void reply.status(error.statusCode).send(body)
}

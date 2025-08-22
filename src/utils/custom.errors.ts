export class ValidationError extends Error {
  messages: string[];
  constructor(messages: string[] | string) {
    const arr = Array.isArray(messages) ? messages : [messages];
    super(arr.join(', '));
    this.name = 'ValidationError';
    this.messages = arr;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
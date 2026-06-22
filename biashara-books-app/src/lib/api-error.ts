export class ApiError extends Error {
  readonly fields: Record<string, string[]>;

  constructor(message: string, fields: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.fields = fields;
  }
}

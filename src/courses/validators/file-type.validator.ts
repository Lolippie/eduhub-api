import { FileValidator } from '@nestjs/common';

export class FileTypeValidator extends FileValidator<string[]> {
  constructor(private readonly allowedTypes: string[]) {
    super(allowedTypes);
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;
    return this.allowedTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `Type de fichier non autorisé`;
  }
}

import { FileValidator } from '@nestjs/common';
import { extname } from 'node:path';

interface IFileExtensionTypeValidatorProps {
  allowedExtensions: string[];
}

export class FileExtensionTypeValidator extends FileValidator<IFileExtensionTypeValidatorProps> {
  constructor(allowedExtensions: string[]) {
    super({ allowedExtensions });
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;
    const extension = extname(file.originalname).toLowerCase();
    return this.validationOptions.allowedExtensions.includes(extension);
  }

  buildErrorMessage(): string {
    return 'Extension de fichier non autorisée';
  }
}

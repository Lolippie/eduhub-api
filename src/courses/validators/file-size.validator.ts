import { FileValidator } from '@nestjs/common';

interface IFileSizeValidatorProps {
  maxSize: number;
}
export class FileSizeValidator extends FileValidator<IFileSizeValidatorProps> {
  constructor(private readonly maxSize: number) {
    super({maxSize});
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false;
    return file.size <= this.maxSize;
  }

  buildErrorMessage(): string {
    return `Fichier trop volumineux`;
  }
}

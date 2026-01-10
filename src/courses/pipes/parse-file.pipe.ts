import { ParseFilePipe } from '@nestjs/common';
import { FileSizeValidator, FileTypeValidator, FileExtensionTypeValidator} from '../validators';

export function createFileValidationPipe() {
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
    ];
    const ALLOWED_EXTENSIONS = [
        '.pdf',
        '.docx',
        '.jpg',
        '.jpeg'
    ];


  return new ParseFilePipe({
    validators: [
      new FileTypeValidator(ALLOWED_MIME_TYPES),
      new FileSizeValidator(MAX_FILE_SIZE),
      new FileExtensionTypeValidator(ALLOWED_EXTENSIONS),
    ],
  });
}

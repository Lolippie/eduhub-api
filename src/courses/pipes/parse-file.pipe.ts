import { ParseFilePipe,PipeTransform, BadRequestException  } from '@nestjs/common';
import { FileSizeValidator, FileTypeValidator, FileExtensionTypeValidator} from '../validators';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/x-pdf',
  'application/octet-stream',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'text/plain'
];

const ALLOWED_EXTENSIONS = [
    '.pdf',
    '.docx',
    '.jpg',
    '.jpeg',
    '.txt'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function createFileValidationPipe(fileIsRequired = true) {
  return new ParseFilePipe({
    validators: [
      new FileTypeValidator(ALLOWED_MIME_TYPES),
      new FileSizeValidator(MAX_FILE_SIZE),
      new FileExtensionTypeValidator(ALLOWED_EXTENSIONS),
    ],
    fileIsRequired,
  });
}

export function createFilesValidationPipe(fileIsRequired = true) {
  return new (class implements PipeTransform {
    async transform(files: Express.Multer.File[] | undefined) {
      
      if (!files || files.length === 0) {
        if (fileIsRequired) throw new BadRequestException('File is required');
        return files;
      }

      const validators = [
        new FileTypeValidator(ALLOWED_MIME_TYPES),
        new FileSizeValidator(MAX_FILE_SIZE),
        new FileExtensionTypeValidator(ALLOWED_EXTENSIONS),
      ];

      for (const file of files) {
        for (const v of validators) {
          if (!v.isValid(file)) {
            throw new BadRequestException(v.buildErrorMessage());
          }
        }
      }

      return files;
    }
  })();
}

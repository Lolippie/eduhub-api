import { SetMetadata } from '@nestjs/common';
import { Role } from 'generated/prisma';

export const IS_ADMIN = Role.ADMIN;
export const IS_TEACHER = Role.TEACHER;
export const IS_STUDENT = Role.STUDENT;

export const Admin = () => SetMetadata(IS_ADMIN, true);
export const Teacher = () => SetMetadata(IS_TEACHER, true);
export const Student = () => SetMetadata(IS_STUDENT, true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
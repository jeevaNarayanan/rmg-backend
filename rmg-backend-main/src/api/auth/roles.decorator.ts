import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const Public = () => SetMetadata('isPublic', true);

export const SkipToken = () => SetMetadata('skipToken', true);

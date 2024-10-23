import { PickType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PickType(CreatePermissionDto, ['method', 'api_path'] as const) {}

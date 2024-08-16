import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class AuthDto {
  @IsString()
  @ApiProperty({ required: true, example: 'caolong', type: String })
  username: string;

  @IsString()
  @ApiProperty({ required: true, example: 'dseoiuasdas', type: String })
  password: string;
}

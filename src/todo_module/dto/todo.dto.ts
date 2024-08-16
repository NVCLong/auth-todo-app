import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class TodoDto {
  @IsNotEmpty()
  content: string;
}

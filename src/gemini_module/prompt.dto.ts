import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ExactLevel} from './exact-level.dto'; // Assuming your enum is in this file

export class PromptDto {
    @IsNotEmpty()
    @IsString()
    prompt: string;

    @IsEnum(ExactLevel) 
    exactLevel: ExactLevel;
}
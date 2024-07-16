import { IsNotEmpty } from "class-validator";

export class PhotoDTO{
    @IsNotEmpty()
    file:Express.Multer.File;
    @IsNotEmpty()
    noteId: number
}
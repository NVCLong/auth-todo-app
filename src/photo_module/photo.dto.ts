import { IsNotEmpty } from "class-validator";

export class PhotoDTO{
    file:Express.Multer.File;
    noteId: number
}
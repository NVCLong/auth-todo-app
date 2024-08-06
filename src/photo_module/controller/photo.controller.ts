import {  Controller, Get, Param, Post, Query, UseInterceptors, UploadedFile, Res, Header  } from '@nestjs/common';
import { TracingService } from 'src/logger/tracing/tracing.service';
import { Public } from 'src/meta/public.meta';
import { PhotoDTO } from '../photo.dto';
import { PhotoService } from '../service/photo.service';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('photo')
export class PhotoController {
    constructor(private readonly logger:TracingService, private readonly photoService:PhotoService){
    }
    @Public()
    @UseInterceptors(FileInterceptor('file'))
    @Post('upload/:noteId')
    async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Param('noteId') noteId: number) {
        this.logger.verbose('Starting uploading photo', [PhotoController.name]);
        if(file===undefined){
            this.logger.warn("Missing file", [PhotoController.name]);
            return []
        } 

        if(noteId===null){
            this.logger.warn("Missing note Id", [PhotoController.name])
            return []
        }
        // upload photo code here
        let body=new PhotoDTO()
        body.file=file
        body.noteId=noteId
        return this.photoService.uploadPhoto(body)
    }


    @Public()
    @Get()
    @Header('Content-Type','image/png')
    async getPhoto(@Query("fileName")fileName:string, @Res()res){
        this.logger.verbose('Starting getting photo with file name: '+ fileName, [PhotoController.name]);
        if(fileName===""){
            this.logger.warn("Missing file name in query", [PhotoController.name])
        }
        // get photo code here
        return (await this.photoService.getPhoto(fileName)).pipe(res)
    }
}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TracingService } from 'src/logger/tracing/tracing.service';
import { Public } from 'src/meta/public.meta';
import { PhotoDTO } from '../photo.dto';
import { PhotoService } from '../service/photo.service';

@Controller('photo')
export class PhotoController {
    constructor(private readonly logger:TracingService, private readonly photoService:PhotoService){
        this.logger.setContext(PhotoController.name)
    }

    @Public()
    @Post('upload')
    async uploadPhoto(@Body("photo") body: PhotoDTO) {
        this.logger.verbose('Starting uploading photo');
        if(body.file===null){
            this.logger.warn("Missing file")
            return []
        } 

        if(body.noteId===null){
            this.logger.warn("Missing note Id")
            return []
        }
        // upload photo code here
        return this.photoService.uploadPhoto(body)
        
    }


    @Public()
    @Get()
    async getPhoto(@Query("id")id: number){
        this.logger.verbose('Starting getting photo with id: '+ id);
        // get photo code here
        return { message: "Photo fetched successfully" }
    }
}

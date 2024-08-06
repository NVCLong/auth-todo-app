import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AzureBlobService } from 'src/azure_module/azure-blob.service';
import { Photo } from 'src/entities/photo.entity';
import { Todo } from 'src/entities/todo.entity';
import { Repository } from 'typeorm';
import { TracingService } from 'src/logger/tracing/tracing.service';
import { PhotoDTO } from '../photo.dto';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    private readonly azureBlobService: AzureBlobService,
    private readonly logger:TracingService
  ) {}

  async uploadPhoto(body:PhotoDTO){
    try{
      this.logger.verbose("Starting to solving upload photo request",[PhotoService.name])
      const note= await this.todoRepository.findOneBy({id:body.noteId})
      if(note===null){
        this.logger.warn("Missing note Id", [PhotoService.name])
        return {
          message:"No note found, and upload fail",
        }
      }
      const uploadStatus= await this.azureBlobService.uploadImage(body.file)
      if(!uploadStatus){
        this.logger.error("Error uploading image", [PhotoService.name])
      }
      
      const photo=await this.photoRepository.create({
        url: body.file.originalname,
        todo:note
      })
      await this.photoRepository.save(photo)
      this.logger.log("Upload image successfully", [PhotoService.name])
      return {
        message:"Successfully uploaded",
      }
    }catch(e){
     this.logger.error("Error uploading image "+ e, [PhotoService.name])
    }
  }


  async getPhoto(fileName:string){
    try{
      this.logger.verbose("Starting to solving get photo request",[PhotoService.name])
      const file= await this.azureBlobService.getImage(fileName);
      this.logger.log("Get file success "+ fileName,[PhotoService.name])
      return file
    }catch(e){
      this.logger.error("Error getting image "+ e, [PhotoService.name])
    }
  }
}

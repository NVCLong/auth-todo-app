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

    }catch(e){
     this.logger
    }
  }
}

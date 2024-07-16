import { Module } from '@nestjs/common';
import { PhotoController } from './controller/photo.controller';
import { PhotoService } from './service/photo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from 'src/entities/photo.entity';
import { todo } from 'node:test';
import { Todo } from 'src/entities/todo.entity';
import { AzureBlobModule } from 'src/azure_module/azure-blob.module';
import { AzureBlobService } from 'src/azure_module/azure-blob.service';

@Module({
    imports:[TypeOrmModule.forFeature([Photo, Todo]), AzureBlobModule],
    controllers:[PhotoController],
    providers:[PhotoService, AzureBlobService],
    exports:[PhotoService]
})
export class PhotoModule {}

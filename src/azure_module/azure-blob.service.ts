import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { File } from "buffer";
import { randomUUID } from "crypto";
import { TracingService } from "src/logger/tracing/tracing.service";
import { UUID } from "typeorm/driver/mongodb/bson.typings";


@Injectable()
export class AzureBlobService{
    private blobClientService: BlobServiceClient
    private containerClient: ContainerClient
    
    constructor(private configService: ConfigService, private readonly logger: TracingService )
    {
        this.logger.setContext(AzureBlobService.name)
        this.blobClientService= BlobServiceClient.fromConnectionString(configService.get<string>("AZURE_CONNECTION_STRING"))
        this.containerClient= this.blobClientService.getContainerClient(configService.get<string>("CONTAINER_NAME"))
        
    }

    private getBlobClient(imagename:string){
        return this.containerClient.getBlockBlobClient(imagename);
    }

    async uploadImage(file:Express.Multer.File ){
        try{
            const url= file.originalname;
            const blockBlobClient= this.getBlobClient(url);
            await blockBlobClient.uploadData(file.buffer)

        }catch(e){
            this.logger.error(`Error while uploading image ${file.originalname}`,e)
            throw new Error(`Error while uploading image ${file.originalname}`)
        }
    }

    async getImage(fileName:string){
        try{
            const blockBlobClient= this.getBlobClient(fileName);
            const downloadResponse= await blockBlobClient.download();
            return downloadResponse.readableStreamBody;
        }catch(e){
            this.logger.error(`Error while getting image ${fileName}`,e)
            throw new Error(`Error while getting image ${fileName}`)
        }
    }

}
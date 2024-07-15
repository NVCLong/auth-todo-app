import { Injectable } from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { UserDto } from "./dto/user.dto";
import { AuthDto } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { jwtSecret } from 'src/untils/constants';
import { Request, Response } from 'express';
import { InjectRepository } from "@nestjs/typeorm";
import { TracingService } from "src/tracing/tracing.service";
type LoginResponse ={
    message:string,
    accessToken?:string,
    refreshToken?:string
}

type AuthResponse = {
    message: string
}

@Injectable()
export class AuthService {  
     constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private jwt: JwtService, private readonly logger: TracingService){
        this.logger.setContext(AuthService.name)
     }

     async login(user: AuthDto,req: Request, res: Response): Promise<LoginResponse>{
        try{
        this.logger.debug("Solving login request");
        const username= user.username;
        const foundUser = await this.userRepository.findOneBy({username:username});
        if(foundUser){
            if(bcrypt.compare(user.password,(await foundUser).password)){
                const accessToken= await this.signAccessToken({id: (await foundUser).id, username: (await foundUser).username})
                const refreshToken= await this.signRefreshToken({id: (await foundUser).id, username: (await foundUser).username})
                res.cookie('refresh',refreshToken),{
                    httpOnly:true
                }
                this.logger.debug("Login successfully")
                res.json({
                    message: 'login success',
                    accessToken: accessToken,
                    refreshToken: refreshToken
                  });
            }else{
                this.logger.debug("Login fail via wrong password")
                res.json( {message: "login failure with wrong password"})
            }
        }else{
            this.logger.debug("Login fail via can not find username")
            res.json({message: "login failure"})
        }
        }
        catch(e){
            this.logger.error("Error "+ e.message())
            console.log(e);
        }
        return null;

     }

     async register(user: UserDto):Promise<AuthResponse>{
        this.logger.debug("Solving register request")
        let newUser: User= new User()
        newUser.username=user.username
        newUser.email= user.email
        newUser.password= await this.hashingPassword(user.password)
        console.log(newUser)
        await this.userRepository.save(newUser);
        this.logger.log("Create successfully")
        return {
            message: "Create success"
        }
     }

     async signout(id: number): Promise<AuthResponse>{
        return null;
     }

     private  async hashingPassword(password: string):Promise<string>{
        const saltRounds=10;
        password= await bcrypt.hash(password, saltRounds)
        return password;

     }
    
     async findById(id: number){
        return this.userRepository.findOneById(id)
     }
     private async signAccessToken(args: {id: number, username: string}){
        const payload={
            id: args.id,
            username: args.username
        }

        const token= await this.jwt.signAsync(payload,{
            secret: jwtSecret
        })

        return token;

     }
     private async signRefreshToken(args: {id: number, username: string}){
        const payload={
            id: args.id,
            username: args.username
        }

        const token= await this.jwt.signAsync(payload,{
            secret: jwtSecret,
            expiresIn: '2d'
        })

        return token;

     }

     async regenerateTokens(userId:number){
        const user= await this.userRepository.findOneBy({id:userId})
        let res: AuthResponse
        if(!user){
            res={
                message:"User is an valid"
            }
            return res
        }

        const accessToken= await this.signAccessToken({id:user.id,username:user.username})
        const refreshToken= await this.signRefreshToken({id:user.id,username:user.username})

        return {
            message: "Refresh two Token",
            accessToken: accessToken,
            refreshToken: refreshToken
        }

     }
     

}
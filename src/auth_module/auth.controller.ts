import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Response,
  Request,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { RefreshJwtGuard } from 'src/common/guards/refresh-jwt.guard';
import { Public } from 'src/meta/public.meta';
import { ApiTags } from '@nestjs/swagger';
import { TracingService } from 'src/logger/tracing/tracing.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
})
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly logger: TracingService,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Public()
  @ApiTags('Authentication')
  @Post('login')
  async login(@Body() user: AuthDto, @Response() response, @Request() req) {
    this.logger.verbose('Start to login ', [AuthController.name]);
    this.authService.login(user, req, response);
  }

  @Public()
  @ApiTags('Authentication')
  @Post('signup')
  async signup(@Body() form: UserDto) {
    this.logger.verbose('Start to register an account');
    return this.authService.register(form);
  }

  @Public()
  @ApiTags('Authentication')
  @Get('signout/:id')
  async signout(@Param('id') id: string) {
    this.logger.verbose('Account Sign out');
    return this.authService.signout(parseInt(id));
  }

  @Public()
  @ApiTags('Authentication')
  @UseGuards(RefreshJwtGuard)
  @Get('refreshToken/:userId')
  async refreshToken(@Param('userId') userId: number) {
    this.logger.verbose('RefreshToken');
    return this.authService.regenerateTokens(userId);
  }
}

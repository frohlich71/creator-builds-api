import { Body, Controller, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/constants/metadata';
import { SignInDto } from './DTOs/signIn.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({type: SignInDto})
  @Public()
  @ApiOperation({ summary: 'Login' })
  async signIn(@Request() req) {
    return this.authService.login(req.body);
  }

}

import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/constants/metadata';
import { SignInDto } from './DTOs/signIn.dto';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({type: SignInDto})
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login' })
  async signIn(@Request() req) {
    // req.user já contém o usuário validado pelo LocalStrategy
    return this.authService.login(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    const newAccessToken = await this.authService.refreshToken(refreshToken);
    return newAccessToken;
  }
  

}


  
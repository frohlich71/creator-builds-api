
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Dependencies } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
@Dependencies(AuthService)
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
    this.authService = authService;
  }
ß
  async validate(username:string, password:string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Wrong username or password');
    }
    return user;
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByName(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    console.log(user)
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
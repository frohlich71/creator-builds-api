import { ForbiddenException, Injectable } from '@nestjs/common';
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
    
    if (!user) {
      console.log('User not found:', username);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation:', { username, isPasswordValid });
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return null;
    }

    // Retorna o usuário sem a senha
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.name,
      userId: user._id
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.usersService.findByName(payload.username);


      if (!user) {
        throw new ForbiddenException('User not found');
      }
      
      const newPayload = { username: payload.username, sub: payload.sub };

      const newAccessToken = await this.jwtService.signAsync(
        { username: payload.username, sub: payload.sub },
        { expiresIn: '15m' }
      );


      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      });

      await this.usersService.updateRefreshToken(user._id.toString(), newRefreshToken);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 900,
      };
    } catch (error) {
      console.log(error)
      throw new ForbiddenException('Invalid refresh token', error);
    }
  }

  

  async login(user: any) {
    console.log('Login user:', user);
    
    // Validar se o usuário está autenticado corretamente
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }
    
    const payload = { username: user.username, sub: user.userId };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });


    if (!access_token || !refresh_token) {
      throw new ForbiddenException('Token generation failed');
    }


    const userFound = await this.usersService.findByName(user.username);
    

    if (!userFound) {
      throw new ForbiddenException('User not found');
    }

    await this.usersService.updateRefreshToken(userFound._id.toString(), refresh_token);


    const res = {
      ...userFound,
      access_token: access_token,
      refresh_token: refresh_token,
      expires_in: 900
    }
    
    return res
  }
}

  
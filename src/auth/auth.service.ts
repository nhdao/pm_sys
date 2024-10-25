/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Role } from 'src/roles/entities/role.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto
    const foundUser = await this.userService.findOneByEmail(email)
    if(foundUser) {
      throw new BadRequestException(`User with email ${email} already exists`)
    }
    const hashedPassword = this.getHashedPassword(password)
    createUserDto.password = hashedPassword
    return await this.userService.create(createUserDto)
  }

  async signIn(email: string, password: string, res: Response) {
    const foundUser = await this.userService.findOneByEmail(email)
    let isPasswordCorrect: boolean
    if(foundUser) {
      isPasswordCorrect = await this.checkPassword(password, foundUser.password)
    }
    if(!foundUser || !isPasswordCorrect) {
      throw new BadRequestException('Email or Password incorrect!')
    }
    const payload = {
      sub: 'access token',
      iss: 'from server with love',
      id: foundUser.id,
      email: foundUser.email,
    }
    const refreshToken = this.createRefreshToken(payload)
    await this.userService.updateUserToken(foundUser.id, refreshToken)
    const accessToken = this.jwtService.sign(payload)
    res.cookie('refresh_token', refreshToken, {
      maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION')) * 1000,
      httpOnly: true,
      // secure: true
    })
    res.cookie('access_token', accessToken, {
      maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION')) * 1000,
      httpOnly: true,
      // secure: true
    })
    return {
      access_token:  accessToken,
      refresh_token: refreshToken,
      user: {
        id: foundUser.id,
        email: foundUser.email
      }
    }
  }

  async handleRefreshToken(refreshToken: string, res: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
      })
      const user = await this.userService.findOneByToken(refreshToken)
      if(!user) {
        throw new BadRequestException('Refresh token invalid!!!')
      }
      const { id, email } = user
      const payload = {
        sub: 'refresh token',
        iss: 'from server with love',
        id,
        email
      }
      // Update new refresh token
      const newRefreshToken = this.createRefreshToken(payload)
      await this.userService.updateUserToken(id, newRefreshToken)
      const newAccessToken =  this.jwtService.sign(payload)
      // Clear old cookie before setting a new one (for safety reasons)
      res.clearCookie('refresh_token')
      res.clearCookie('acces_token')

      // Set new refresh token as cookie
      res.cookie('refresh_token', newRefreshToken, { 
        maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION')) * 1000,
        httpOnly: true,
        // secure: true 
      })

      res.cookie('access_token', newAccessToken, { 
        maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION')) * 1000,
        httpOnly: true,
        // secure: true
      })
      return {
        access_token:  newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          email: user.email
        }
      }
    } catch(err) {
      throw new BadRequestException('Refresh token invalid!!!')
    }
  }

  getHashedPassword(password: string) {
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)
    return hashedPassword
  }
  async checkPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
  }

  createRefreshToken = (payload) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') 
    })
    return refreshToken
  }

  async resetPassword(email: string, req: Request) {
    const foundUser = await this.userService.findOneByEmail(email)
    if(!foundUser) {
      throw new BadRequestException('No user found with this email')
    }
    const token = bcrypt.genSaltSync(10)
    const hashedToken = bcrypt.hashSync(token)
    const passwordResetExpiration = new Date((Date.now() + 10 * 60 * 1000))
    await this.userService.saveResetToken(foundUser, hashedToken, passwordResetExpiration) 
    const resetLink = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${req.params.token}`
    console.log(resetLink)
    await this.mailService.sendForgetPasswordLink(email, resetLink)
  }

  async forgetPassword(code: string, newPassword: string) {
    // Verify code
    const hashedToken = bcrypt.hashSync(code)
    const foundUser = await this.userService.findOneByResetToken(hashedToken)
    if(!foundUser) {
      throw new BadRequestException('Token invalid or has expired')
    }
    // Update new password
    await this.userService.saveResetToken(foundUser, null, null)
    const hashedPassword = this.getHashedPassword(newPassword)
    await this.userService.updatePassword(foundUser, hashedPassword)
  }

  async validateToken(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
    })
  }

  async getUserDetail(id: number) {
    return await this.userService.getDetail(id)
  }

  async getUserPermissions(role: Role) {
    return await this.userService.getUserPermissions(role)
  }
}

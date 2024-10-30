/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Role } from 'src/roles/entities/role.entity';
import { MailService } from 'src/mail/mail.service';
import { IUser } from 'src/interfaces/current-user.interface';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private redisService: RedisService
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
    const accessToken = this.jwtService.sign(payload)
    const accessTokenCookieTTL = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION').slice(0, -1)
    const refreshTokenCookieTTL = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION').slice(0, -1)
    res.clearCookie('refresh_token')
    res.clearCookie('acces_token')
    res.cookie('refresh_token', refreshToken, {
      maxAge: +refreshTokenCookieTTL * 60 * 1000,
      httpOnly: true,
      // secure: true
    })
    res.cookie('access_token', accessToken, {
      maxAge: +accessTokenCookieTTL * 60 * 1000,
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

  async signOut(req: Request, currentUser: IUser) {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1]
      const refreshToken = req.headers['x-refresh-token'] as string
      if(!accessToken || !refreshToken) {
        throw new BadRequestException('Token missing')
      }
      // Add token pair to blacklist 
      const accessTokenTTL = +this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION').slice(0, -1) *  60
      const refreshTokenTTL = +this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION').slice(0, -1) *  60
      if(!await this.redisService.checkKeyExist(accessToken)) {
        await this.redisService.setKeyWithEx(accessToken, currentUser.id, accessTokenTTL)
      }
      if(!await this.redisService.checkKeyExist(refreshToken)) {
        await this.redisService.setKeyWithEx(refreshToken, currentUser.id, refreshTokenTTL)
      }

      return `You've been signed out`
    } catch(err) {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async handleRefreshToken(refreshToken: string, res: Response) {
      const checkTokenBlacklisted = await this.redisService.checkKeyExist(refreshToken)
      if(checkTokenBlacklisted) {
        throw new UnauthorizedException('Invalid token')
      }
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
      })
   
      const { id, email } = decoded
      const payload = {
        sub: 'refresh token',
        iss: 'from server with love',
        id,
        email
      }
      const newRefreshToken = this.createRefreshToken(payload)
      const newAccessToken =  this.jwtService.sign(payload)

      const blacklistTTL = +this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION').slice(0, -1) *  60 * 1000
      await this.redisService.setKeyWithEx(refreshToken, id, blacklistTTL)

      // Clear old cookie before setting a new one (for safety reasons)
      res.clearCookie('refresh_token')
      res.clearCookie('acces_token')
      const accessTokenCookieTTL = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION').slice(0, -1)
      const refreshTokenCookieTTL = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION').slice(0, -1)
      // Set new refresh token as cookie
      res.cookie('refresh_token', newRefreshToken, { 
        maxAge: +accessTokenCookieTTL * 60 * 1000,
        httpOnly: true,
        // secure: true 
      })

      res.cookie('access_token', newAccessToken, { 
        maxAge: +refreshTokenCookieTTL * 60 * 1000,
        httpOnly: true,
        // secure: true
      })
      return {
        access_token:  newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          id,
          email
        }
      }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, currentUser: IUser) {
      const { oldPassword, newPassword } = changePasswordDto
      const foundUser = await this.userService.getUserPassword(+currentUser.id)
      const isPasswordCorrect = await this.checkPassword(oldPassword, foundUser.password)
      if(!isPasswordCorrect) {
        throw new BadRequestException('Password not correct')
      }
      const newHashedPassword = this.getHashedPassword(newPassword)
      foundUser.password = newHashedPassword
      await this.userService.updatePassword(foundUser, newHashedPassword)
      return 'Change password successfully'
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
    const passwordResetExpiration = new Date((Date.now() + 10 * 60 * 1000))
    await this.userService.saveResetToken(foundUser, token, passwordResetExpiration) 
    const resetLink = `${req.protocol}://${req.get('host')}/api/auth/forget-password/${token}`
    await this.mailService.sendForgetPasswordLink(email, resetLink)
    return 'Check your email to reset your password'
  }

  async forgetPassword(code: string, newPassword: string) {
    // Verify code
    const foundUser = await this.userService.findOneByResetToken(code)
    if(!foundUser) {
      throw new BadRequestException('Token invalid or has expired')
    }
    // Update new password
    const hashedPassword = this.getHashedPassword(newPassword)
    await this.userService.updatePassword(foundUser, hashedPassword)
    await this.userService.saveResetToken(foundUser, null, null)
    return 'Reset password successfully'
  }

  async validateToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
      })
    } catch(err) {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async getUserDetail(id: number) {
    return await this.userService.getDetail(id)
  }

  async getUserPermissions(role: Role) {
    return await this.userService.getUserPermissions(role)
  }
}

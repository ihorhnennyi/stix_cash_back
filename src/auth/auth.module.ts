import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'

import { MailModule } from '../mail/mail.module'
import { AuthService } from './auth.service'
import { EmailVerificationService } from './email-verification.service'
import { JwtStrategy } from './jwt.strategy'
import { PasswordResetService } from './password-reset.service'

import { User, UserSchema } from '../user/schema/user.schema'
import { AuthController } from './auth.controller'
import { PasswordResetController } from './password-reset.controller'

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN')
        }
      })
    }),
    MailModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [AuthController, PasswordResetController],
  providers: [AuthService, JwtStrategy, EmailVerificationService, PasswordResetService],
  exports: [AuthService, EmailVerificationService, PasswordResetService]
})
export class AuthModule {}

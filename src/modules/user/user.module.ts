import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db/prisma.service';
import { ConfigService } from 'src/configuration/config.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService, PrismaService, ConfigService]
})
export class UserModule {}

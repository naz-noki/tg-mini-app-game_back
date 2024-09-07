import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { PrismaService } from "./db/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "./configuration/config.service";
import { UserModule } from "./modules/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { CorsMiddleware } from "./middlewares/cors.middleware";
import * as cookieParser from "cookie-parser"; 
import * as morgan from "morgan";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_PATH || "./env",
    }),
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_SECRET || "SECRET",
      signOptions: { expiresIn: "15m", },
    }),

    UserModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(), morgan("combined"), CorsMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  };
}

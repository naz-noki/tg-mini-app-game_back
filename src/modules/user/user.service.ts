import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/db/prisma.service";
import { UserDTO } from "./dto/user.dto";
import { JwtService } from "@nestjs/jwt";
import { genSalt, hash, compare } from "bcrypt";
import { ConfigService } from "src/configuration/config.service";

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {};

    private async setRefreshToken(userId: number, refreshToken: string, action: "save" | "update") {
        const salt = await genSalt(9);
        const token = await hash(refreshToken, salt);

        if(action === "save") await this.prismaService.refresh_tokens.create({ 
            data: {
                user_id: userId,
                token: token,
            },
        });
        else await this.prismaService.refresh_tokens.update({ 
            where: {
                user_id: userId,
            }, 
            data: {
                token: token,
            }, 
        });
    };

    private async checkRefreshToken(userId: number, refreshToken: string) {
        try { 
            // Получаем токен по user id
            const token = await this.prismaService.refresh_tokens.findUnique({ where: { user_id: userId, } });
            if(!token) return {status: false, msg: "The token was not found."};
            // Сравниваем токены 
            const checkTokens = await compare(refreshToken, token.token);
            if(!checkTokens) return {status: false, msg: "The tokens do not match."};  
            // Проверяем токен 
            this.jwtService.verify(refreshToken, { secret: this.configService.GetENV("JWT_SECRET"), });            

            return {status: true, msg: "OK."};
        } catch(e) {
            return {status: false, msg: "The token is not valid."};    
        };
    };

    async UpdateTokens(user: UserDTO, refreshToken: string) {
        // Получаем id пользователя по tg id 
        const data = await this.prismaService.users.findUnique({ where: { tg_id: user.tg_id, } });
        // Проверяем refresh токен
        const checkToken = await this.checkRefreshToken(data.id, refreshToken);
        if(!checkToken.status) throw new HttpException(checkToken.msg, HttpStatus.BAD_REQUEST);
        // Получаем новые токены 
        const payload = { tg_id: user.tg_id };
        const newAccessToken = this.jwtService.sign(payload, { secret: this.configService.GetENV("JWT_SECRET"), expiresIn: "15m" });
        const newRefreshToken = this.jwtService.sign(payload, { secret: this.configService.GetENV("JWT_SECRET"), expiresIn: "7d" });
        // Сохраняем refresh токен
        await this.setRefreshToken(data.id, newRefreshToken, "update");

        return {newAccessToken, newRefreshToken};
    };

    async CreateUser(user: UserDTO) {
        const data = await this.prismaService.users.create({ data: {tg_id: user.tg_id, name: user.name} });
        await this.prismaService.points.create({ data: { user_id: data.id, count: 0, } });
    };

    async CheckUser(user: UserDTO) {
        // Проверяем существует ли, пользователь с таким tg_id
        const checkExistUser = await this.prismaService.users.findUnique({ where: {tg_id: user.tg_id} });
        if(!checkExistUser) throw new HttpException("A user with such a Telegram ID does not exist.", HttpStatus.NOT_FOUND);
        // Получаем токены 
        const payload = { tg_id: user.tg_id };
        const accessToken = this.jwtService.sign(payload, { secret: this.configService.GetENV("JWT_SECRET"), expiresIn: "15m" });
        const refreshToken = this.jwtService.sign(payload, { secret: this.configService.GetENV("JWT_SECRET"), expiresIn: "7d" });
        // Сохраняем refresh токен
        await this.setRefreshToken(checkExistUser.id, refreshToken, "save");

        return {accessToken, refreshToken};
    };
};


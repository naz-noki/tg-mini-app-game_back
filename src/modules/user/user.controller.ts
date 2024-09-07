import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Res, Req } from "@nestjs/common";
import { UserDTO, IsUserDTO } from "./dto/user.dto";
import { UserService } from "./user.service";
import { Response, Request } from "express";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { I_AuthorizationResponse } from "./user.types";
import CheckValue from "src/helpers/checkValue";

@ApiTags("User")
@Controller("api/users")
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {};

    @Post("registration")
    @ApiOperation({ summary: "Create user" })
    @ApiResponse({ status: HttpStatus.CREATED, description: "The user has been successfully created." })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Not all data has been sent to the server or the data sent to the server is not valid." })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid user data from Telegram has been transferred to the server." })
    @HttpCode(HttpStatus.CREATED)
    async Registration(@Body() user: UserDTO) {
        // Проверяем данные переданные на сервер
        if(!IsUserDTO(user)) throw new HttpException("Not all data has been sent to the server or the data sent to the server is not valid.", HttpStatus.BAD_REQUEST);
        // Регистрация
        await this.userService.CreateUser(user);
    };

    @Post("authorization")
    @ApiOperation({ summary: "Check user" })
    @ApiBody({ type: UserDTO })
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: "The user has successfully passed the verification.", type: I_AuthorizationResponse  })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Not all data has been sent to the server or the data sent to the server is not valid." })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid user data from Telegram has been transferred to the server." })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "A user with such a Telegram ID does not exist." }) 
    @HttpCode(HttpStatus.ACCEPTED)
    async Authorization(@Res() res: Response, @Body() user: UserDTO) {
        // Проверяем данные переданные на сервер
        if(!IsUserDTO(user)) throw new HttpException("Not all data has been sent to the server or the data sent to the server is not valid.", HttpStatus.BAD_REQUEST);
        // Аторизация
        const data = await this.userService.CheckUser(user);
        
        res.cookie("refresh_token", data.refreshToken, { httpOnly: true, });
        res.json({
            access_token: data.accessToken,
        });
    };

    @Post("update/tokens")
    @ApiOperation({ summary: "Update JWT for user" })
    @ApiBody({ type: UserDTO })
    @ApiResponse({ status: HttpStatus.ACCEPTED, description: "The tokens have been successfully updated.", type: I_AuthorizationResponse  })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Refresh token has not been sent to the server."  })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Not all data has been sent to the server or the data sent to the server is not valid." })
    @HttpCode(HttpStatus.ACCEPTED)
    async UpdateTokens(@Req() req: Request, @Res() res: Response, @Body() user: UserDTO) {
        // Получаем refresh токен из куки
        const refresh_token = req.cookies.refresh_token;
        if(!CheckValue(refresh_token)) throw new HttpException("Refresh token has not been sent to the server.", HttpStatus.UNAUTHORIZED);
        // Проверяем данные переданные на сервер
        if(!IsUserDTO(user)) throw new HttpException("Not all data has been sent to the server or the data sent to the server is not valid.", HttpStatus.BAD_REQUEST);
        // Обновление токенов 
        const data = await this.userService.UpdateTokens(user, refresh_token);

        res.cookie("refresh_token", data.newRefreshToken, { httpOnly: true, });
        res.json({
            access_token: data.newAccessToken,
        });
    };
}

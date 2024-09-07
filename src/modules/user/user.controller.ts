import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, Res } from "@nestjs/common";
import { UserDTO, IsUserDTO } from "./dto/user.dto";
import { UserService } from "./user.service";
import { Response } from "express";

@Controller("api/users")
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {};

    @Post("registration")
    @HttpCode(HttpStatus.CREATED)
    async Registration(@Body() user: UserDTO) {
        if(!IsUserDTO(user)) throw new HttpException("Not all data has been sent to the server or the data sent to the server is not valid.", HttpStatus.BAD_REQUEST);
        await this.userService.CreateUser(user);
    };

    @Post("authorization")
    @HttpCode(HttpStatus.ACCEPTED)
    async Authorization(@Res() res: Response, @Body() user: UserDTO) {
        if(!IsUserDTO(user)) throw new HttpException("Not all data has been sent to the server or the data sent to the server is not valid.", HttpStatus.BAD_REQUEST);
        const data = await this.userService.CheckUser(user);
        
        res.cookie("refresh_token", data.refreshToken, { httpOnly: true, });
        res.json({
            access_token: data.accessToken,
        });
    };
}

import { ApiProperty } from "@nestjs/swagger";

export class UserDTO {
    @ApiProperty()
    id: number;

    @ApiProperty({ required: false, description: "The name that the user enters when registering." })
    name?: string;

    @ApiProperty()
    first_name: string;

    @ApiProperty()
    last_name: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    language_code: string;
};

export const IsUserDTO = (value: any): value is UserDTO => {
    if(typeof value !== "object") return false;

    if(("name" in value) && typeof value.name !== "string") return false;

    if(!("id" in value) || typeof value.id !== "number") return false;
    if(!("first_name" in value) && typeof value.first_name !== "string") return false;
    if(!("last_name" in value) && typeof value.last_name !== "string") return false;
    if(!("username" in value) && typeof value.username !== "string") return false;
    if(!("language_code" in value) && typeof value.language_code !== "string") return false;

    return true;
};

export interface I_UserDB {
    id?: number;
    name: string;
    tg_id: number;
};

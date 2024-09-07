export class UserDTO {
    tg_id: number;
    name?: string;
};

export const IsUserDTO = (value: any): value is UserDTO => {
    if(typeof value !== "object") return false;
    if(!("tg_id" in value) || typeof value.tg_id !== "number") return false;
    if(("name" in value) && typeof value.name !== "string") return false;

    return true;
};

export interface I_UserDB extends UserDTO {
    id?: number;
    name: string;
};

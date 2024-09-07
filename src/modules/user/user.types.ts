import { ApiProperty } from "@nestjs/swagger";

// -----------------------------------
// CONSTANTS
// -----------------------------------

// -----------------------------------
// REQUEST BODY
// -----------------------------------

// -----------------------------------
// RESPONSE BODY
// -----------------------------------
export class I_AuthorizationResponse {
    @ApiProperty()
    access_token: string;
};

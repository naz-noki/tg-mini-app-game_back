import { Injectable } from "@nestjs/common";
import { I_Config } from "./config.types";

@Injectable()
export class ConfigService {
    constructor() {};

    GetENV<T extends keyof I_Config>(key: T) {
        return process.env[key];
    };
};

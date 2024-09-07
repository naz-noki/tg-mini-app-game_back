import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as cors from "cors";

@Injectable()
export class CorsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const origins = process.env.ALLOW_ORIGINS || "*";
        
        const opt: cors.CorsOptions = {
            origin: origins.split(", "),
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        };

        cors(opt)(req, res, next);
    };
}

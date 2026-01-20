import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { ChamadasController } from "./chamadas.controller";
import { ChamadasService } from "./chamadas.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    imports:[AuthModule],
    controllers: [ChamadasController],
    providers: [ChamadasService, PrismaService]
})
export class ChamadasModule {} 
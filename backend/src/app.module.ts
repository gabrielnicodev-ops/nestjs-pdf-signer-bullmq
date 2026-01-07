import { Module, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { promises as fs } from 'fs';
import * as path from 'path';
import { SignerController } from "./signer/signer.controller";
import { SignerService } from "./signer/signer.service";
import { PdfProcessor } from "./signer/pdf.processor";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>("REDIS_URL"),
          tls: { rejectUnauthorized: false },
        },
      }),
    }),
    BullModule.registerQueue({
      name: "pdf-signer",
    }),
  ],
  controllers: [SignerController],
  providers: [
    SignerService,
    PdfProcessor, // <--- AGREGAR ESTO PARA QUE NEST ACTIVE EL WORKER
  ],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger("Infrastructure");

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const folders = ["./uploads", "./src/keys"];

    for (const folder of folders) {
      const folderPath = path.resolve(folder);
      try {
        await fs.access(folderPath);
      } catch {
        this.logger.log(`Creating missing directory: ${folder}`);
        await fs.mkdir(folderPath, { recursive: true });
      }
    }
  }

  async onApplicationBootstrap() {
    this.logger.log("🚀 NestJS Application Bootstrap Sequence Initiated");

    // Verificación de integridad de variables críticas
    const redisUrl = this.configService.get("REDIS_URL");
    if (!redisUrl) {
      this.logger.error(
        "❌ Critical Error: REDIS_URL is not defined in environment variables."
      );
      process.exit(1);
    }

    this.logger.log(
      "🔗 Redis Connectivity: Handshake initiated with Upstash via TLS."
    );
  }
}

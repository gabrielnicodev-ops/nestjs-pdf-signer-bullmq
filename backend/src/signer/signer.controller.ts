import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Param,
  Header,
  HttpStatus,
  HttpException,
  Logger,
} from "@nestjs/common";
import { SignerService } from "./signer.service";
import { Response } from "express";
import * as path from "path";
import { promises as fs } from 'fs';
import { UploadPdfDto } from "./dto/upload-pdf.dto";

@Controller("signer")
export class SignerController {
  constructor(private readonly signerService: SignerService) {}

  private readonly logger = new Logger(SignerService.name);
  // Servir el index (opcional si usas ServeStaticModule)
  @Get()
  getIndex(@Res() res: Response) {
    res.sendFile(path.join(process.cwd(), "src/public/index.html"));
  }

  @Post("uploader")
  async upload(@Body() body: UploadPdfDto) {
    // NestJS validará esto automáticamente
    return await this.signerService.enqueueSignJob(body.data);
  }

  @Get("download/:jobId")
  async downloadFile(@Param("jobId") jobId: string, @Res() res: Response) {
    const filePath = path.resolve(`./uploads/${jobId}_signed.pdf`);

    try {
      // 1. Verificamos si existe antes de intentar cualquier operación
      await fs.access(filePath);

      // 2. Enviamos el archivo
      // Usamos res.download que es más robusto para archivos físicos
      res.download(filePath, `signed_${jobId}.pdf`, async (err) => {
        if (err) {
          this.logger.error(`Error during file transmission: ${err.message}`);
          return;
        }

        // 3. LIMPIEZA: Una vez enviado con éxito, lo borramos
        try {
          await fs.unlink(filePath);
          this.logger.debug(`File ${jobId}_signed.pdf deleted after download.`);
        } catch (unlinkErr) {
          this.logger.warn(
            `Could not delete file after download: ${unlinkErr.message}`
          );
        }
      });
    } catch (error) {
      throw new HttpException(
        "Document not found or still processing",
        HttpStatus.NOT_FOUND
      );
    }
  }
}

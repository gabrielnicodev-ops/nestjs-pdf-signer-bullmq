import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import SignPDF from '../utils/SignPDF.js';
import * as fs from 'fs';
import * as path from 'path';

@Processor('pdf-signer')
export class PdfProcessor extends WorkerHost {
  // Instanciamos el logger con el contexto de la clase
  private readonly logger = new Logger(PdfProcessor.name);
  private readonly p12Path = path.resolve('./src/keys/localhost.p12');

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, data } = job.data;
    const tempPath = path.resolve(`./uploads/${jobId}_temp.pdf`);
    const finalPath = path.resolve(`./uploads/${jobId}_signed.pdf`);

    this.logger.log(`[Job ${job.id}] 🚀 Iniciando procesamiento para el archivo: ${jobId}`);

    try {
      // 1. Persistencia temporal
      this.logger.debug(`[Job ${job.id}] Guardando archivo temporal en: ${tempPath}`);
      fs.writeFileSync(tempPath, data, 'base64');

      // 2. Verificación de llave .p12
      if (!fs.existsSync(this.p12Path)) {
        throw new Error(`Certificate not found at ${this.p12Path}`);
      }

      // 3. Proceso de firma
      this.logger.log(`[Job ${job.id}] ✍️ Firmando documento digitalmente...`);
      const signer = new SignPDF(tempPath, this.p12Path);
      const signedBuffer = await signer.signPDF(process.env.KS_PASSWORD);

      // 4. Guardar resultado y limpieza
      this.logger.debug(`[Job ${job.id}] Escribiendo archivo firmado y eliminando temporal.`);
      fs.writeFileSync(finalPath, signedBuffer);
      
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      this.logger.log(`[Job ${job.id}] ✅ Proceso finalizado exitosamente.`);
      return { status: 'completed', path: finalPath };

    } catch (error) {
      this.logger.error(`[Job ${job.id}] ❌ Error crítico durante la firma: ${error.message}`, error.stack);
      
      // Limpieza preventiva en caso de error
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      
      // Re-lanzamos el error para que BullMQ lo marque como 'failed' y aplique el backoff
      throw error;
    }
  }
}
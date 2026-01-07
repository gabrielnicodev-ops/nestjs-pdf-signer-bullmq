import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SignerController } from './signer.controller';
import { SignerService } from './signer.service';
import { PdfProcessor } from './pdf.processor'; // El nuevo Worker

@Module({
  imports: [
    // Registramos la cola específica para este módulo
    BullModule.registerQueue({
      name: 'pdf-signer',
    }),
  ],
  controllers: [SignerController],
  providers: [
    SignerService, 
    PdfProcessor // ¡Importante! El procesador debe estar aquí para que Nest lo active
  ],
})
export class SignerModule {}
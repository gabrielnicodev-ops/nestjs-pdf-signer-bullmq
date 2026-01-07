import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import { PDFDocument } from "pdf-lib";

@Injectable()
export class SignerService {
  private readonly logger = new Logger(SignerService.name);
  private readonly uploadsDir = path.resolve("./uploads");

  constructor(@InjectQueue("pdf-signer") private readonly pdfQueue: Queue) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // --- New validation function ---
  async isValidPdf(base64Data: string): Promise<boolean> {
    try {
      const buffer = Buffer.from(base64Data, "base64");
      // We attempt to load the document. If it's not a valid PDF, it will throw an error.
      await PDFDocument.load(buffer, { ignoreEncryption: true });
      return true;
    } catch (e) {
      this.logger.error(
        "PDF validation failed: The file is corrupted or not a PDF"
      );
      return false;
    }
  }

  async enqueueSignJob(base64Data: string) {
    // 1. Validate before doing anything
    const valid = await this.isValidPdf(base64Data);
    if (!valid) {
      throw new BadRequestException(
        "The provided file is not a valid PDF or is corrupted."
      );
    }

    try {
      const fileUuid = crypto.randomUUID(); // Generate your unique ID

      const job = await this.pdfQueue.add(
        "sign-pdf-task",
        { jobId: fileUuid, data: base64Data },
        { jobId: fileUuid }
      );

      this.logger.log(`Job queued with ID: ${job.id} for PDF signing.`);
      return {
        jobId: job.id,
        status: "queued",
        message: "The file is being processed and signed.",
      };
    } catch (error) {
      this.logger.error(`BullMQ error: ${error.message}`);
      // Here we throw the error that our "Queue failure" test expects
      throw new InternalServerErrorException(
        "Error queuing the signing process"
      );
    }
  }

  async getSignedFile(jobId: string): Promise<Buffer> {
    const filePath = path.resolve(`./uploads/${jobId}_signed.pdf`);

    if (!fs.existsSync(filePath)) {
      throw new Error("The file is not ready yet or the Job ID is invalid");
    }

    return fs.readFileSync(filePath);
  }
}

import { Test, TestingModule } from "@nestjs/testing";
import { SignerService } from "./signer.service";
import { getQueueToken } from "@nestjs/bull";
import { BadRequestException } from "@nestjs/common/exceptions/bad-request.exception";
import { InternalServerErrorException } from "@nestjs/common/exceptions/internal-server-error.exception";

describe("SignerService", () => {
  let service: SignerService;
  let queueMock: any;
  let pdfQueue: any;

  beforeEach(async () => {
    // Creamos un mock de la cola de BullMQ
    queueMock = {
      add: jest.fn().mockResolvedValue({ id: "123" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignerService,
        {
          provide: getQueueToken("pdf-signer"),
          useValue: queueMock,
        },
      ],
    }).compile();

    service = module.get<SignerService>(SignerService);
    pdfQueue = module.get(getQueueToken('pdf-signer'));
  });

  it("debería estar definido", () => {
    expect(service).toBeDefined();
  });

  it("debería encolar un trabajo de firma y devolver el jobId", async () => {
    const base64Data = "JVBERi0xLjQK...";
    const result = await service.enqueueSignJob(base64Data);

    expect(queueMock.add).toHaveBeenCalledWith(
      "sign-pdf-task",
      expect.objectContaining({ data: base64Data }),
      expect.any(Object)
    );
    expect(result).toHaveProperty("jobId", "123");
    expect(result.status).toBe("queued");
  });

  it("debería lanzar BadRequestException si el PDF es inválido", async () => {
    const base64Corrupto = "bm90LWEtcGRm"; // "not-a-pdf" en base64

    await expect(service.enqueueSignJob(base64Corrupto)).rejects.toThrow(
      BadRequestException
    );
  });

  it("debería lanzar InternalServerErrorException si BullMQ falla", async () => {
    const base64Valido = "JVBERi0xLjQK..."; // Un string base64 que simule un PDF

    // Simulamos que la cola falla al hacer .add()
    jest
      .spyOn(pdfQueue, "add")
      .mockRejectedValue(new Error("Redis connection error"));

    await expect(service.enqueueSignJob(base64Valido)).rejects.toThrow(
      InternalServerErrorException
    );
  });
});

import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFHexString,
  PDFString,
} from "pdf-lib";
import { SignPdf } from 'node-signpdf';
import * as fs from 'fs';
import PDFArrayCustomHelper from "./PDFArrayCustom";

export default class SignPDF {
  private pdfBuffer: Buffer;
  private certificate: Buffer;
  private readonly signer = new SignPdf();

  constructor(pdfFilePath: string, certFilePath: string) {
    this.pdfBuffer = fs.readFileSync(pdfFilePath);
    this.certificate = fs.readFileSync(certFilePath);
  }

  async signPDF(password: string): Promise<Buffer> {
    let pdfWithPlaceholder = await this._addPlaceholder();
    
    // TRUCO SEMI-SENIOR: Limpiamos el buffer para asegurar que termine en %%EOF
    pdfWithPlaceholder = this.trimBuffer(pdfWithPlaceholder);

    try {
      const signedPdf = this.signer.sign(pdfWithPlaceholder, this.certificate, {
        passphrase: password
      });
      return signedPdf;
    } catch (error) {
      // Si el error persiste, imprimimos el final del buffer para debuguear
      console.log('Final del PDF:', pdfWithPlaceholder.slice(-10).toString());
      throw error;
    }
  }

  // Método para limpiar el buffer de caracteres basura al final
  private trimBuffer(buffer: Buffer): Buffer {
    const lastEOF = buffer.lastIndexOf('%%EOF');
    if (lastEOF === -1) {
      throw new Error('El documento no parece ser un PDF válido (falta %%EOF)');
    }
    // Retornamos el buffer cortado exactamente donde termina el %%EOF + los caracteres de cierre
    return buffer.slice(0, lastEOF + 5);
  }

  private async _addPlaceholder(): Promise<Buffer> {
    const loadedPdf = await PDFDocument.load(this.pdfBuffer);
    const ByteRange = PDFArrayCustomHelper.create(loadedPdf.context);
    const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
    
    // Aumentamos el tamaño del placeholder
    // 8192 es un valor seguro para llaves RSA 4096 y certificados complejos
    const SIGNATURE_LENGTH = 8192; 

    const pages = loadedPdf.getPages();

    ByteRange.push(PDFNumber.of(0));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));

    const signatureDict = loadedPdf.context.obj({
      Type: 'Sig',
      Filter: 'Adobe.PPKLite',
      SubFilter: 'adbe.pkcs7.detached',
      ByteRange,
      Contents: PDFHexString.of('A'.repeat(SIGNATURE_LENGTH)),
      Reason: PDFString.of('Digital Signature'),
      M: PDFString.fromDate(new Date()),
    });

    const signatureDictRef = loadedPdf.context.register(signatureDict);

    const widgetDict = loadedPdf.context.obj({
      Type: 'Annot',
      Subtype: 'Widget',
      FT: 'Sig',
      Rect: [0, 0, 0, 0],
      V: signatureDictRef,
      T: PDFString.of('Signature1'),
      F: 4,
      P: pages[0].ref,
    });

    const widgetDictRef = loadedPdf.context.register(widgetDict);
    pages[0].node.set(PDFName.of('Annots'), loadedPdf.context.obj([widgetDictRef]));

    loadedPdf.catalog.set(
      PDFName.of('AcroForm'),
      loadedPdf.context.obj({
        SigFlags: 3,
        Fields: [widgetDictRef],
      })
    );

    const pdfBytes = await loadedPdf.save({ useObjectStreams: false });
    return Buffer.from(pdfBytes); // Más limpio que el bucle manual unit8ToBuffer
  }
}
import { PDFArray, CharCodes, PDFContext } from "pdf-lib";

export default class PDFArrayCustomHelper {
  /**
   * Crea una instancia de PDFArray y le inyecta el comportamiento de serialización 
   * personalizado requerido para firmas digitales.
   */
  static create(context: PDFContext): PDFArray {
    const array = PDFArray.withContext(context);

    // Sobrescribimos el método copyBytesInto de la instancia (Monkey Patching controlado)
    // Esto evita el error de constructor privado del "extends"
    array.copyBytesInto = (buffer: Uint8Array, offset: number): number => {
      const initialOffset = offset;
      buffer[offset++] = CharCodes.LeftSquareBracket;
      
      for (let idx = 0, len = array.size(); idx < len; idx++) {
        offset += array.get(idx).copyBytesInto(buffer, offset);
        if (idx < len - 1) buffer[offset++] = CharCodes.Space;
      }
      
      buffer[offset++] = CharCodes.RightSquareBracket;
      return offset - initialOffset;
    };

    return array;
  }
}
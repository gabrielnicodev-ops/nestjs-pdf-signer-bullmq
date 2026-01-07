import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UploadPdfDto {
  @IsString()
  @IsNotEmpty({ message: 'El contenido del PDF es obligatorio' })
  // Validamos que sea un Base64 válido para evitar procesar basura
  @Matches(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, {
    message: 'El formato debe ser un Base64 válido',
  })
  data: string;
}
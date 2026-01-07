// frontend/src/services/pdf.service.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

export const pdfService = {
  // 1. Envía el HTML y recibe un jobId
  sendToSign: async (base64Data: string) => {
    const { data } = await api.post('/signer/uploader', { data: base64Data });
    return data; // { jobId: "..." }
  },

  // 2. Consulta si el archivo ya está firmado
  downloadFinished: async (jobId: string) => {
    return api.get(`/signer/download/${jobId}`, { responseType: 'blob' });
  }
};
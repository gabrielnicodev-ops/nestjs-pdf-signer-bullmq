import { useState } from 'react';
import { pdfService } from '../services/pdf.service';

export const usePdfSigner = () => {
  const [status, setStatus] = useState<'idle' | 'signing' | 'downloading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const processAndSign = async (pdfBase64: string) => {
    setStatus('signing');
    try {
      // Enviar a la cola
      const { jobId } = await pdfService.sendToSign(pdfBase64);
      
      // Polling: Preguntar cada 3 segundos si ya está listo      
      const checkInterval = setInterval(async () => {
        try {
          const response = await pdfService.downloadFinished(jobId);
          if (response.status === 200) {
            clearInterval(checkInterval);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'documento_firmado.pdf');
            document.body.appendChild(link);
            link.click();
            setStatus('idle');
          }
        } catch (e) {
          // Si da 404 es que aún no está listo, seguimos esperando
        }
      }, 3000);

    } catch (err) {
      setError('Error al procesar el documento');
      setStatus('error');
    }
  };

  return { processAndSign, status, error };
};
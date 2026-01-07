import { useState } from 'react';
import { usePdfSigner } from './hooks/usePdfSigner';
import { convertHtmlToPdfBase64 } from './utils/pdfConverter';

export function App() {
  const [htmlContent, setHtmlContent] = useState(`
    <div style="padding: 20px;">
      <h1 style="color: #1e40af; font-size: 24px;">Contrato de Servicios</h1>
      <p style="margin-top: 10px;">Este documento será procesado y firmado digitalmente.</p>
    </div>
  `);
  
  const { processAndSign, status } = usePdfSigner();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">PDF</div>
          <h1 className="text-lg font-bold tracking-tight">Signer<span className="text-blue-600">Pro</span></h1>
        </div>
        
        <button
          onClick={() => convertHtmlToPdfBase64('pdf-preview').then(processAndSign)}
          disabled={status !== 'idle'}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
        >
          {status === 'signing' ? 'Procesando...' : 'Firmar Documento'}
        </button>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex flex-1 overflow-hidden">
        {/* EDITOR (Izquierda) */}
        <div className="w-1/2 flex flex-col p-4 bg-white border-r border-slate-200">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2">Código HTML</label>
          <textarea
            className="flex-1 w-full p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-colors resize-none"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
          />
        </div>

        {/* PREVIEW (Derecha) */}
        <div className="w-1/2 bg-slate-200 overflow-y-auto p-8 flex justify-center">
          <div className="shadow-2xl origin-top scale-[0.85] xl:scale-100">
            <div 
              id="pdf-preview"
              className="bg-white w-[210mm] min-h-[297mm] shadow-sm"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


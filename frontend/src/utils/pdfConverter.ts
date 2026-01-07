import html2pdf from "html2pdf.js";

/**
 * Convierte un string de HTML a un Buffer/Base64 de PDF.
 * Se utiliza una escala de 2 para mejorar la nitidez del texto y las imágenes.
 */
export const convertHtmlToPdfBase64 = async (
  htmlElementId: string | HTMLElement
): Promise<string> => {
  // 1. Obtener el elemento del DOM
  const element =
    typeof htmlElementId === "string"
      ? document.getElementById(htmlElementId)
      : htmlElementId;

  if (!element) {
    throw new Error("No se encontró el elemento HTML para convertir a PDF");
  }

  // 2. Configuración profesional de html2pdf
  const options = {
    margin: [10, 10] as [number, number],
    filename: "document.pdf",
    image: { type: "jpeg" as const, quality: 0.98 }, // <--- Agregamos 'as const'
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm" as const, // <--- También aquí por seguridad
      format: "a4" as const,
      orientation: "portrait" as const,
    },
  };

  try {
    // 3. Generar el PDF como Data URL string
    // Usamos el flujo de trabajo de promesas de html2pdf.js
    const pdfBase64WithHeader: string = await html2pdf()
      .from(element)
      .set(options)
      .outputPdf("datauristring");

    // 4. Limpiar el string para enviar solo el Base64 puro al backend
    // El formato original es "data:application/pdf;filename=generated.pdf;base64,JVBERi..."
    const base64Pure = pdfBase64WithHeader.split(",")[1];

    return base64Pure;
  } catch (error) {
    console.error("Error en la conversión de HTML a PDF:", error);
    throw new Error("Falló la generación del PDF. Revisa el contenido HTML.");
  }
};

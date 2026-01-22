/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(error: unknown, context: string): string {
    let rawMessage = 'Ocorreu um erro desconhecido.';
    if (error instanceof Error) {
        rawMessage = error.message;
    } else if (typeof error === 'string') {
        rawMessage = error;
    } else if (error) {
        rawMessage = String(error);
    }

    // Check for specific unsupported MIME type error from Gemini API
    if (rawMessage.includes("Unsupported MIME type")) {
        try {
            // It might be a JSON string like '{"error":{"message":"..."}}'
            const errorJson = JSON.parse(rawMessage);
            const nestedMessage = errorJson?.error?.message;
            if (nestedMessage && nestedMessage.includes("Unsupported MIME type")) {
                const mimeType = nestedMessage.split(': ')[1] || 'unsupported';
                return `O tipo de arquivo '${mimeType}' não é suportado. Por favor, use um formato como PNG, JPEG ou WEBP.`;
            }
        } catch (e) {
            // Not a JSON string, but contains the text. Fallthrough to generic message.
        }
        // Generic fallback for any "Unsupported MIME type" error
        return `Formato de arquivo não suportado. Por favor, envie uma imagem nos formatos PNG, JPEG ou WEBP.`;
    }

    // Check for Quota/Rate Limit errors (429)
    if (rawMessage.includes("RESOURCE_EXHAUSTED") || rawMessage.includes("429") || rawMessage.includes("quota")) {
        return "Limite de cota excedido. A API gratuita do Gemini tem limites de uso. Por favor, aguarde um momento antes de tentar novamente ou verifique os limites do seu plano.";
    }
    
    return `${context}. ${rawMessage}`;
}

// Helper to convert image URL to a File object using a canvas to bypass potential CORS issues.
export const urlToFile = (url: string, filename: string): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context.'));
            }
            ctx.drawImage(image, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error('Canvas toBlob failed.'));
                }
                const mimeType = blob.type || 'image/png';
                const file = new File([blob], filename, { type: mimeType });
                resolve(file);
            }, 'image/png');
        };

        image.onerror = (error) => {
            // Fallback for when canvas fails (e.g. strict CORS), try direct fetch
            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], filename, { type: blob.type });
                    resolve(file);
                })
                .catch(fetchErr => {
                    reject(new Error(`Could not load image from URL. Canvas error: ${error}. Fetch error: ${fetchErr}`));
                });
        };

        image.src = url;
    });
};
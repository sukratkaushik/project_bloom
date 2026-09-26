/**
 * Client-Side Image Compression Utility
 * Resizes high-resolution mobile camera photos (12-50MP, 5-20MB) down to an optimal
 * dimension (<= 1024px) and compresses to ~150-250KB before uploading to AI vision models.
 * Prevents 413 Payload Too Large, timeouts, and network failure on mobile data.
 */

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  base64Data: string;
  mimeType: string;
  width: number;
  height: number;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export async function compressImage(
  file: File,
  maxDimension = 1024,
  quality = 0.8
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a supported image format.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into memory for processing.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Downscale while strictly maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Browser canvas is not available on this device.'));
        }

        // Fill background with white in case original was transparent PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Normalize to standard high-efficiency JPEG
        const targetMime = 'image/jpeg';
        const dataUrl = canvas.toDataURL(targetMime, quality);
        const base64Data = dataUrl.split(',')[1];

        // Create Blob and File
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: targetMime });
        const compressedFile = new File(
          [blob], 
          file.name.replace(/\.[^.]+$/, '.jpg'), 
          { type: targetMime, lastModified: Date.now() }
        );

        resolve({
          file: compressedFile,
          dataUrl,
          base64Data,
          mimeType: targetMime,
          width,
          height,
          originalSizeKb: Math.round(file.size / 1024),
          compressedSizeKb: Math.round(blob.size / 1024),
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

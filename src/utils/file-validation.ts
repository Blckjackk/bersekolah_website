/**
 * Utility functions for file validation
 */

// Define common interfaces for document types
export interface DocumentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  is_required?: boolean;
  allowed_formats: string[];
  max_file_size: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Validates a file against the document type requirements
 * @param file File to validate
 * @param docType DocumentType containing validation rules
 * @param onError Callback function for error display (optional)
 * @returns boolean indicating if file is valid
 */
export function validateFile(
  file: File, 
  docType: DocumentType, 
  onError?: (title: string, description: string) => void
): boolean {
  const allowedFormats = docType.allowed_formats || ['jpg', 'jpeg', 'png', 'pdf'];
  const maxSize = docType.max_file_size || (5 * 1024 * 1024); // Default 5MB

  // Check file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedFormats.includes(fileExtension)) {
    if (onError) {
      onError(
        "Format File Tidak Sesuai",
        `File "${file.name}" tidak dapat diterima. Format yang diizinkan untuk dokumen ${docType.name} adalah: ${allowedFormats.join(', ').toUpperCase()}`
      );
    }
    return false;
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
    
    if (onError) {
      onError(
        "Ukuran File Terlalu Besar",
        `File "${file.name}" berukuran ${fileSizeMB}MB, melebihi batas maksimal ${maxSizeMB}MB untuk dokumen ${docType.name}`
      );
    }
    return false;
  }

  return true;
}

/**
 * Formats file size into human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string (e.g. "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if file is a PDF based on file extension or type
 * @param fileName File name
 * @param fileType Optional MIME type
 * @returns boolean indicating if file is a PDF
 */
export function isFilePDF(fileName: string, fileType?: string): boolean {
  if (!fileName && !fileType) return false;
  
  // Check file type if available
  if (fileType) {
    if (fileType.toLowerCase() === 'pdf' || 
        fileType.toLowerCase() === 'application/pdf' || 
        fileType.toLowerCase().includes('pdf')) {
      return true;
    }
  }
  
  // Check filename extension
  if (fileName) {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return true;
    }
    
    // Also check for "pdf" in the filename as a fallback
    if (fileName.toLowerCase().includes('pdf')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if file is an image based on extension or type
 * @param fileName File name
 * @param fileType Optional MIME type
 * @returns boolean indicating if file is an image
 */
export function isFileImage(fileName: string, fileType?: string): boolean {
  if (!fileName && !fileType) return false;
  
  // Check file type if available
  if (fileType) {
    if (fileType.toLowerCase().includes('image/') || 
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext => fileType.toLowerCase().includes(ext))) {
      return true;
    }
  }
  
  // Check file extension
  if (fileName) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }
  
  return false;
}

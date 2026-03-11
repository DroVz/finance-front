import api from './api';
import type { CsvPreviewResponse, CsvImportRequest, CsvImportResult } from '@/types';

/**
 * Service pour l'import de fichiers CSV bancaires
 */
const csvImportService = {
  /**
   * Envoie un fichier CSV pour obtenir un aperçu des transactions détectées
   */
  async preview(file: File, accountId: number): Promise<CsvPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accountId', accountId.toString());

    const response = await api.post<CsvPreviewResponse>('/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Confirme l'import des transactions validées
   */
  async confirmImport(request: CsvImportRequest): Promise<CsvImportResult> {
    const response = await api.post<CsvImportResult>('/import/confirm', request);
    return response.data;
  }
};

export default csvImportService;

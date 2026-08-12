import { apiGet } from '@/lib/api/client';
import { TraceabilityData } from '@/types';

export const traceabilityService = {
  async getTraceability(batchCode: string): Promise<TraceabilityData> {
    return apiGet<TraceabilityData>(`/traceability/${batchCode}`);
  },

  async getProductTraceability(productId: number): Promise<TraceabilityData> {
    return apiGet<TraceabilityData>(`/traceability/product/${productId}`);
  },
};
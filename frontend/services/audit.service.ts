import { adminService } from '@/services/admin.service';
import { AuditLog, PaginatedData } from '@/types';

export const auditService = {
  async list(page = 1, perPage = 20, filters?: { action?: string; user_id?: number; from?: string; to?: string }): Promise<PaginatedData<AuditLog>> {
    return adminService.getAuditLogs(page, perPage, filters);
  },
};
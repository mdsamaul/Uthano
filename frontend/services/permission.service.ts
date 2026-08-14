import { adminService } from '@/services/admin.service';
import { AccessCatalog, MyAccess } from '@/types';

export const permissionService = {
  async catalog(): Promise<AccessCatalog> {
    return adminService.getAccessCatalog();
  },
  async myAccess(): Promise<MyAccess> {
    return adminService.getMyAccess();
  },
};
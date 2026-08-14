import { adminService } from '@/services/admin.service';
import { Role } from '@/types';

export const roleService = {
  async list(): Promise<Role[]> {
    return adminService.getRoles();
  },
  async get(id: number): Promise<Role> {
    return adminService.getRole(id);
  },
  async create(data: { name: string; slug: string; description?: string; permissions?: number[] }): Promise<Role> {
    return adminService.createRole(data);
  },
  async update(id: number, data: { name?: string; slug?: string; description?: string; permissions?: number[] }): Promise<Role> {
    return adminService.updateRole(id, data);
  },
  async remove(id: number): Promise<void> {
    return adminService.deleteRole(id);
  },
  async syncPermissions(id: number, permissions: number[]): Promise<Role> {
    return adminService.updateRolePermissions(id, permissions);
  },
};
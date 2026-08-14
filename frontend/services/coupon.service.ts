import { adminService } from '@/services/admin.service';
import { Coupon, PaginatedData } from '@/types';

export const couponService = {
  async list(page = 1, perPage = 20, search?: string): Promise<PaginatedData<Coupon>> {
    return adminService.getCoupons(page, perPage, search);
  },
  async get(id: number): Promise<Coupon> {
    return adminService.getCoupon(id);
  },
  async create(data: Partial<Coupon>): Promise<Coupon> {
    return adminService.createCoupon(data);
  },
  async update(id: number, data: Partial<Coupon>): Promise<Coupon> {
    return adminService.updateCoupon(id, data);
  },
  async remove(id: number): Promise<void> {
    return adminService.deleteCoupon(id);
  },
  async toggle(id: number): Promise<Coupon> {
    return adminService.toggleCoupon(id);
  },
};
<?php

namespace App\Services;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Model;

class CouponService
{
    public function createCoupon(array $data): Coupon
    {
        return Coupon::create($data);
    }

    public function updateCoupon(Coupon $coupon, array $data): Coupon
    {
        $coupon->update($data);

        return $coupon->fresh();
    }

    public function toggleCoupon(Coupon $coupon): Coupon
    {
        $coupon->update([
            'is_active' => !$coupon->is_active,
        ]);

        return $coupon->fresh();
    }
}
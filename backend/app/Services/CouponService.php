<?php

namespace App\Services;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Model;

class CouponService
{
        /**
     * Normalize a coupon type token into the backend canonical form
     * (uppercase: 'FIXED' / 'PERCENTAGE') so any frontend casing passes.
     */
    private function normalizeType(array $data): array
    {
        if (isset($data['type'])) {
                        $normalized = strtolower((string) $data['type']);
            $map = [
                'fixed'      => 'FIXED',
                'percent'    => 'PERCENTAGE',
                'percentage' => 'PERCENTAGE',
            ];
            $data['type'] = $map[$normalized] ?? strtoupper($normalized);
        }

        return $data;
    }

    public function createCoupon(array $data): Coupon
    {
        return Coupon::create($this->normalizeType($data));
    }

    public function updateCoupon(Coupon $coupon, array $data): Coupon
    {
        $coupon->update($this->normalizeType($data));

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
<?php

namespace App\Services;

use App\Models\ProductReview;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;

class ProductReviewService
{
    public function createReview(array $data, int $customerId): ProductReview
    {
        $data['customer_id'] = $customerId;

        return ProductReview::create($data);
    }

    public function updateReview(ProductReview $review, array $data): ProductReview
    {
        $review->update($data);

        return $review->fresh();
    }

    public function approveReview(ProductReview $review): ProductReview
    {
        $review->update([
            'status' => 'APPROVED',
        ]);

        return $review->fresh();
    }

    public function rejectReview(ProductReview $review, string $reason): ProductReview
    {
        $review->update([
            'status' => 'REJECTED',
        ]);

        return $review->fresh();
    }
}
<?php

namespace App\Services;

use App\Models\QualityCheck;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QualityCheckService
{
    public function createQualityCheck(array $data, int $checkedByUserId): QualityCheck
    {
        $data['checked_by'] = $checkedByUserId;
        $data['checked_at'] = now();

        return QualityCheck::create($data);
    }

    public function updateQualityCheck(QualityCheck $qualityCheck, array $data): QualityCheck
    {
        $qualityCheck->update($data);

        return $qualityCheck->fresh();
    }

    public function approveQualityCheck(QualityCheck $qualityCheck, int $approvedByUserId): QualityCheck
    {
        $qualityCheck->update([
            'status' => 'APPROVED',
        ]);

        return $qualityCheck->fresh();
    }

    public function rejectQualityCheck(QualityCheck $qualityCheck, string $reason, int $rejectedByUserId): QualityCheck
    {
        $qualityCheck->update([
            'status' => 'REJECTED',
            'notes' => $qualityCheck->notes . "\n\nRejection Reason: " . $reason,
        ]);

        return $qualityCheck->fresh();
    }
}
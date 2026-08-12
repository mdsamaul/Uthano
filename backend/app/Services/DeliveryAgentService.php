<?php

namespace App\Services;

use App\Models\DeliveryAgent;
use Illuminate\Database\Eloquent\Model;

class DeliveryAgentService
{
    public function createAgent(array $data): DeliveryAgent
    {
        return DeliveryAgent::create($data);
    }

    public function updateAgent(DeliveryAgent $agent, array $data): DeliveryAgent
    {
        $agent->update($data);

        return $agent->fresh();
    }

    public function toggleAgentStatus(DeliveryAgent $agent): DeliveryAgent
    {
        $agent->update([
            'status' => $agent->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        ]);

        return $agent->fresh();
    }
}
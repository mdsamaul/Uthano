<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'is_active' => $this->is_active,
            'role' => $this->role ?? 'customer',
            'roles' => $this->relationLoaded('roles')
                ? $this->roles->pluck('slug')->toArray()
                : [$this->role ?? 'customer'],
            'permissions' => $this->whenLoaded('permissions', fn () => $this->permissions->pluck('slug')->toArray(), fn () => $this->allPermissions()->toArray()),
            'is_superadmin' => $this->isSuperAdmin(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

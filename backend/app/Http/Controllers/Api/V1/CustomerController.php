<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerAddressRequest;
use App\Http\Resources\CustomerAddressResource;
use App\Http\Resources\CustomerProfileResource;
use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $profile = $request->user()->customerProfile()->with('addresses')->firstOrFail();

        return ApiResponse::success('Customer profile fetched successfully', new CustomerProfileResource($profile));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $profile = $request->user()->customerProfile()->firstOrFail();

        $validated = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'alternate_phone' => ['nullable', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('customer-photos', 'public');
        }

        $profile->update($validated);

        return ApiResponse::success('Customer profile updated successfully', new CustomerProfileResource($profile->load('addresses')));
    }

    public function addresses(Request $request): JsonResponse
    {
        $addresses = $request->user()->customerProfile()->firstOrFail()
            ->addresses()
            ->orderByDesc('is_default')
            ->get();

        return ApiResponse::success('Customer addresses fetched successfully', CustomerAddressResource::collection($addresses));
    }

    public function storeAddress(CustomerAddressRequest $request): JsonResponse
    {
        $profile = $request->user()->customerProfile()->firstOrFail();

        $data = $request->validated();
        $data['customer_profile_id'] = $profile->id;

        if ($request->boolean('is_default')) {
            $profile->addresses()->update(['is_default' => false]);
        }

        $address = CustomerAddress::create($data);

        return ApiResponse::created('Address created successfully', new CustomerAddressResource($address));
    }

    public function updateAddress(CustomerAddressRequest $request, int $id): JsonResponse
    {
        $profile = $request->user()->customerProfile()->firstOrFail();

        $address = CustomerAddress::where('id', $id)
            ->where('customer_profile_id', $profile->id)
            ->firstOrFail();

        $data = $request->validated();

        if ($request->boolean('is_default')) {
            $profile->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return ApiResponse::success('Address updated successfully', new CustomerAddressResource($address));
    }

    public function destroyAddress(Request $request, int $id): JsonResponse
    {
        $profile = $request->user()->customerProfile()->firstOrFail();

        $address = CustomerAddress::where('id', $id)
            ->where('customer_profile_id', $profile->id)
            ->firstOrFail();

        $address->delete();

        return ApiResponse::noContent();
    }
}
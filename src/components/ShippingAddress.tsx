// components/ShippingAddress.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Address } from "@/types";

interface ShippingAddressProps {
  useExistingAddress: boolean;
  onUseExistingAddressChange: (checked: boolean) => void;
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  addressData: Omit<Address, "_id">;
  onAddressDataChange: (data: Omit<Address, "_id">) => void;
  currentUser: any;
}

export function ShippingAddress({
  useExistingAddress,
  onUseExistingAddressChange,
  selectedAddressId,
  onAddressSelect,
  addressData,
  onAddressDataChange,
  currentUser,
}: ShippingAddressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
        {(currentUser?.addresses?.length ?? 0) > 0 && (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="useExistingAddress"
              checked={useExistingAddress}
              onCheckedChange={(checked) => onUseExistingAddressChange(checked === true)}
            />
            <label
              htmlFor="useExistingAddress"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use saved address
            </label>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {useExistingAddress && (currentUser?.addresses?.length ?? 0) > 0 ? (
          <div className="grid gap-2">
            <Label htmlFor="savedAddress">Select Address</Label>
            <Select value={selectedAddressId} onValueChange={onAddressSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select an address" />
              </SelectTrigger>
              <SelectContent>
                {currentUser?.addresses.map((address: Address) => (
                  <SelectItem key={address._id} value={address._id || ""}>
                    {address.street}, {address.city}, {address.state}, {address.zipCode}
                    {address.isDefault && " (Default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={addressData.street}
                onChange={(e) => onAddressDataChange({ ...addressData, street: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={addressData.street}
                onChange={(e) => onAddressDataChange({ ...addressData, street: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={addressData.city}
                  onChange={(e) => onAddressDataChange({ ...addressData, city: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={addressData.state}
                  onChange={(e) => onAddressDataChange({ ...addressData, state: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={addressData.zipCode}
                onChange={(e) => onAddressDataChange({ ...addressData, zipCode: e.target.value })}
                required
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
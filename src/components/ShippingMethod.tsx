// components/ShippingMethod.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ShippingMethodProps {
  shippingMethod: string;
  onShippingMethodChange: (method: string) => void;
  shippingMethods: {
    id: string;
    name: string;
    description: string;
    price: number;
  }[];
}

export function ShippingMethod({
  shippingMethod,
  onShippingMethodChange,
  shippingMethods,
}: ShippingMethodProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue={shippingMethod}
          onValueChange={onShippingMethodChange}
          className="grid gap-4"
        >
          {shippingMethods.map((method) => (
            <Label
              key={method.id}
              htmlFor={method.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:border-primary"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value={method.id} id={method.id} />
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {method.description}
                  </div>
                </div>
              </div>
              <div className="font-medium">
                {method.price === 0 ? "Free" : `₹${method.price}`}
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

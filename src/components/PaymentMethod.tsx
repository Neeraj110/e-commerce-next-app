// components/PaymentMethod.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentMethodProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  paymentMethods: { id: string; name: string; icon: any }[];
}

export function PaymentMethod({
  paymentMethod,
  onPaymentMethodChange,
  paymentMethods,
}: PaymentMethodProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue={paymentMethod}
          onValueChange={onPaymentMethodChange}
          className="grid gap-4"
        >
          {paymentMethods.map((method) => (
            <Label
              key={method.id}
              htmlFor={`payment-${method.id}`}
              className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:border-primary"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                <div className="flex items-center gap-2">
                  <method.icon className="h-4 w-4" />
                  <div className="font-medium">{method.name}</div>
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
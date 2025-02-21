import { Truck, ShieldCheck, RefreshCw } from "lucide-react";

const features = [
  { icon: <Truck className="h-5 w-5" />, text: "Free Delivery" },
  { icon: <ShieldCheck className="h-5 w-5" />, text: "1 Year Warranty" },
  { icon: <RefreshCw className="h-5 w-5" />, text: "7 Days Return" },
];

export default function ProductFeatures() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div key={index} className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
          <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">{feature.icon}</div>
          <span className="text-sm font-medium">{feature.text}</span>
        </div>
      ))}
    </div>
  );
}

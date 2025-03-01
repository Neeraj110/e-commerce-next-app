import { Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Separator } from "./ui/separator";

const features = [
  { icon: <Truck className="h-5 w-5" />, text: "Free Delivery" },
  { icon: <ShieldCheck className="h-5 w-5" />, text: "1 Year Warranty" },
  { icon: <RefreshCw className="h-5 w-5" />, text: "7 Days Return" },
];

export const ProductFeatures = () => (
  <>
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {features.map((feature, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
        >
          <div className="mb-2 rounded-full bg-primary/10 p-2 text-primary">
            {feature.icon}
          </div>
          <span className="text-xs sm:text-sm font-medium">{feature.text}</span>
        </div>
      ))}
    </div>
    <Separator className="my-4" />
  </>
);

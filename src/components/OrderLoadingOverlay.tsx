"use client";

import React, { useEffect, useState } from "react";
import { Package, ShieldCheck, Sparkles, CreditCard, CheckCircle2 } from "lucide-react";

interface OrderLoadingOverlayProps {
  isVisible: boolean;
  paymentMethod?: string;
}

const loadingSteps = [
  { text: "Securing your items...", icon: Package },
  { text: "Verifying address & payment...", icon: CreditCard },
  { text: "Processing your order securely...", icon: ShieldCheck },
  { text: "Finalizing order confirmation...", icon: Sparkles },
];

export const OrderLoadingOverlay: React.FC<OrderLoadingOverlayProps> = ({
  isVisible,
  paymentMethod = "cod",
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const CurrentIcon = loadingSteps[currentStepIndex].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-8 shadow-2xl text-center space-y-6">
        {/* Animated Background Pulse Glow */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl animate-pulse delay-500" />

        {/* Central Animated Icon Loader */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
            <CurrentIcon className="h-8 w-8 animate-bounce" />
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Placing Your Order
          </h3>
          <p className="text-sm font-medium text-primary transition-all duration-300">
            {loadingSteps[currentStepIndex].text}
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex justify-center items-center gap-2 pt-2">
          {loadingSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={index}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isCurrent
                    ? "w-8 bg-primary"
                    : isCompleted
                    ? "w-2.5 bg-primary/60"
                    : "w-2.5 bg-muted"
                }`}
              />
            );
          })}
        </div>

        {/* Safety Note */}
        <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground border flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Please do not refresh or close this page</span>
        </div>
      </div>
    </div>
  );
};

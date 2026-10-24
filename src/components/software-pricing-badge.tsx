import { CircleDollarSign, Sparkles } from "lucide-react";
import type { SoftwareBadgeStyle, SoftwarePriceType } from "@/data/software";

type SoftwarePricingBadgeProps = {
  priceType: SoftwarePriceType;
  price?: string;
  badgeStyle: SoftwareBadgeStyle;
  className?: string;
};

export function SoftwarePricingBadge({ priceType, price, badgeStyle, className = "" }: SoftwarePricingBadgeProps) {
  const paid = priceType === "paid";
  const amount = price?.trim();
  const label = paid ? (amount ? `付费 · ${amount}` : "付费软件") : "免费软件";

  return (
    <span className={`pricing-badge pricing-badge-${badgeStyle} ${paid ? "is-paid" : "is-free"} ${className}`.trim()} aria-label={paid ? (amount ? `付费软件，${amount}` : "付费软件") : "免费软件"}>
      <span className="pricing-badge-mark" aria-hidden="true">{paid ? <CircleDollarSign size={17} strokeWidth={2.1} /> : <Sparkles size={17} strokeWidth={2.1} />}</span>
      <span className="pricing-badge-label">{label}</span>
      <span className="pricing-badge-orbit-track" aria-hidden="true" />
    </span>
  );
}

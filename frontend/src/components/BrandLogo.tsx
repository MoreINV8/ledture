import type { FC } from "react";

import ledtureBanner from "../assets/ledture-banner.svg";
import ledtureLogo from "../assets/ledture-logo.svg";
import { APP_NAME, APP_TAGLINE } from "../constants";
import { cn } from "../utils";

export interface BrandLogoProps {
  className?: string;
}

/** Uses the compact mark on phones and the full banner on wider screens. */
export const BrandLogo: FC<BrandLogoProps> = ({ className }) => (
  <picture className={cn("block shrink-0", className)}>
    <source media="(min-width: 768px)" srcSet={ledtureBanner} />
    <img
      src={ledtureLogo}
      alt={`${APP_NAME} — ${APP_TAGLINE}`}
      className="h-auto w-full object-contain"
    />
  </picture>
);

export default BrandLogo;

import * as React from "react";

import logoHorizontal from "@/assets/brandbook/logo/esquilo-invest-logo-horizontal.svg?raw";
import simbolo from "@/assets/brandbook/logo/esquilo-invest-simbolo.svg?raw";

export function Logo({
  kind = "horizontal",
  className,
  title = "Esquilo Invest",
}: {
  kind?: "horizontal" | "simbolo";
  className?: string;
  title?: string;
}) {
  const svg = kind === "simbolo" ? simbolo : logoHorizontal;
  return (
    <span
      aria-label={title}
      role="img"
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}


import type { ComponentProps } from "react";

// Use browser navigation while Vinext's client-side Link handler is failing.
export default function Link(props: ComponentProps<"a">) {
  return <a {...props} />;
}

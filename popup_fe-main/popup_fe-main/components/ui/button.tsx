import { ButtonProps, Button as HeroButton } from "@heroui/button";
import React from "react";
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type, ...props }, ref) => {
    return <HeroButton type={type} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };

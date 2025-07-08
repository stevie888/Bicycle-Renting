import React from "react";
import {
  Card as HeroCard,
  CardHeader,
  CardBody,
  CardProps,
} from "@heroui/card";

type Props = {
  titleRender: React.ReactNode;
  bodyRender: React.ReactNode;
};
const Card = React.forwardRef<HTMLDivElement, Props & CardProps>(
  ({ titleRender, bodyRender, className, ...props }, ref) => {
    return (
      <HeroCard ref={ref} className={className} {...props}>
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          {titleRender}
        </CardHeader>
        <CardBody>
          {/* <Image
            alt="Card background"
            className="object-cover rounded-xl"
            src="https://heroui.com/images/hero-card-complete.jpeg"
            width={270}
          /> */}
          {bodyRender}
        </CardBody>
      </HeroCard>
    );
  }
);

Card.displayName = "Card";

export default Card;

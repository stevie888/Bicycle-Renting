import React, { useEffect } from "react";
import {
  Modal as HeroModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
} from "@heroui/modal";

type Props = {
  title?: string;
  isOpen: boolean;
  footerRender?: React.ReactNode;
  children: React.ReactNode;
};
const Modal = React.forwardRef<HTMLDivElement, Props & ModalProps>(
  ({ title, size, footerRender, children, isOpen, onClose, ...props }, ref) => {
    return (
      <>
        <HeroModal
          ref={ref}
          isOpen={isOpen}
          size={size}
          onClose={onClose}
          {...props}
        >
          <ModalContent>
            {(onClose) => (
              <>
                {title ? (
                  <ModalHeader className="flex flex-col gap-1">
                    {title}
                  </ModalHeader>
                ) : (
                  <></>
                )}
                <ModalBody>{children}</ModalBody>
                {footerRender ? (
                  <ModalFooter>{footerRender}</ModalFooter>
                ) : (
                  <></>
                )}
              </>
            )}
          </ModalContent>
        </HeroModal>
      </>
    );
  }
);

Modal.displayName = "Modal";
export default Modal;

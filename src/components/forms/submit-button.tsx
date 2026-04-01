"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "../ui/button";

type SubmitButtonProps = ButtonProps & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

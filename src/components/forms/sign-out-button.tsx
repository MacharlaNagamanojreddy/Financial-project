import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "../ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary">
        Sign out
      </Button>
    </form>
  );
}

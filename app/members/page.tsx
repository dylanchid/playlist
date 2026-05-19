import { redirect } from "next/navigation";

/** Member discovery deferred; use discover for now. */
export default function MembersPage() {
  redirect("/discover");
}

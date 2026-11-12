import { redirect } from "next/navigation";

export default function AdminApprovalsRedirect() {
  redirect("/admin?tab=orders");
}

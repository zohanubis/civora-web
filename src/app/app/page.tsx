import { redirect } from "next/navigation";

import { OrganizationWorkspace } from "@/features/organizations/components/organization-workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <OrganizationWorkspace />
    </main>
  );
}

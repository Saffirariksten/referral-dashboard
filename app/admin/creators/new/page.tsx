import { InviteCreatorForm } from "@/components/invite-creator-form";

export default function NewCreatorPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Invite creator</h1>
      <InviteCreatorForm />
    </div>
  );
}

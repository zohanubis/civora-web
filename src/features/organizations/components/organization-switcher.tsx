import type { Organization } from "@/features/organizations/api/organizations";

type OrganizationSwitcherProps = {
  organizations: Organization[];
  value?: string;
  onChange: (organizationId: string) => void;
};

export function OrganizationSwitcher({
  organizations,
  value,
  onChange,
}: OrganizationSwitcherProps) {
  if (organizations.length === 0) {
    return null;
  }

  return (
    <div className="w-full sm:max-w-sm">
      <label htmlFor="organization-switcher" className="text-sm font-medium">
        Organization context
      </label>
      <select
        id="organization-switcher"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
      >
        <option value="" disabled>
          Select an organization
        </option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name} ({organization.status})
          </option>
        ))}
      </select>
    </div>
  );
}

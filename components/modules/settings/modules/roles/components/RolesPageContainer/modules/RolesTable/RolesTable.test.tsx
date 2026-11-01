import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RolesTable from "./RolesTable";
import { partialMock } from "@/test/types";
import { Role } from "@/models/role/Role";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/components/modules/settings/modules/roles/hooks/useRoleDeleteImpact", () => ({
  useRoleDeleteImpact: () => ({ data: undefined, isLoading: false, error: null }),
}));
jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
// The dropdown renders its content inline here; what matters is the React tree.
jest.mock("@/public/desact/src/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr/>,
}));

const role = partialMock<Role>({ id: "r1", name: "Contractor", userCount: 3, archived: false });

/*
  Archiving takes the role from everybody who holds it (WALK_QUESTIONS § 22), so it confirms first
  and says how many people lose it.
*/
describe("RolesTable archive", () => {
  it("asks first, naming how many people lose the role", async () => {
    const onArchiveRole = jest.fn().mockResolvedValue(undefined);
    render(<RolesTable roleRows={[role]} rolesLoading={false} onArchiveRole={onArchiveRole}/>);

    fireEvent.click(screen.getByText("Archive"));

    expect(onArchiveRole).not.toHaveBeenCalled();
    expect(screen.getByText(/taken from 3 people/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() => expect(onArchiveRole).toHaveBeenCalledWith("r1", true));
  });

  it("keeps the dialog open with the refusal when archiving fails", async () => {
    const onArchiveRole = jest.fn().mockRejectedValue(new Error("Archive refused"));
    render(<RolesTable roleRows={[role]} rolesLoading={false} onArchiveRole={onArchiveRole}/>);

    fireEvent.click(screen.getByText("Archive"));
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    expect(await screen.findByText("Archive refused")).toBeInTheDocument();
  });
});

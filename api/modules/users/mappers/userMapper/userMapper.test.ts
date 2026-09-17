import { userMapper } from "./userMapper";
import type { UserDTO } from "@/api/modules/users/dto";
import { partialMock } from "@/test/types";

const dto = (over: Partial<UserDTO> = {}): UserDTO =>
  partialMock<UserDTO>({
    id: "u1",
    companyId: "c1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    roles: [],
    status: "ACTIVE",
    isEmailVerified: true,
    lastLoginAt: "2026-08-01T10:00:00Z",
    avatarUrl: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    custom: {},
    ...over,
  });

describe("UserMapper", () => {
  /**
   * The regression this file exists for: the profile's tabs and their gate read
   * `user.capabilities` and nothing else, so a mapper that quietly dropped the field hid Documents
   * and Time Off from **everyone** — own profile included — and turned a typed tab URL into a 403
   * page. The backend had been sending it all along; this seam was the only thing in the way.
   */
  it("carries the per-target capability map through", () => {
    const user = userMapper.mapUserDTOtoUser(
      dto({
        capabilities: {
          "PEOPLE.PROFILE": ["VIEW", "EDIT"],
          "PEOPLE.DOCUMENTS": ["VIEW"],
          "PEOPLE.TIME_OFF": ["VIEW", "EDIT"],
        },
      })
    );

    expect(user.capabilities).toEqual({
      "PEOPLE.PROFILE": ["VIEW", "EDIT"],
      "PEOPLE.DOCUMENTS": ["VIEW"],
      "PEOPLE.TIME_OFF": ["VIEW", "EDIT"],
    });
  });

  it("leaves capabilities undefined when the response carries none", () => {
    expect(userMapper.mapUserDTOtoUser(dto()).capabilities).toBeUndefined();
  });

  it("carries the sign-in lock through", () => {
    expect(userMapper.mapUserDTOtoUser(dto({ accountStatus: "ACTIVE", accountLocked: true })).accountLocked).toBe(true);
  });

  it("carries the field-access map through", () => {
    const user = userMapper.mapUserDTOtoUser(
      dto({ fieldAccess: { "sys:email": "VIEW", "attr:salary": "MASKED" } })
    );

    expect(user.fieldAccess).toEqual({ "sys:email": "VIEW", "attr:salary": "MASKED" });
  });
});

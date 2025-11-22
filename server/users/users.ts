import "server-only";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

export async function getUserServer(id: string) {
  // Если нужен ISR — раскомментируй next.revalidate
  // return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`, { next: { revalidate: 60 } }).then(r => r.json());
  return hrisApiUsersService.getUser(id);
}

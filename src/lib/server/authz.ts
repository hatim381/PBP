import { getSql } from "@/lib/db";
import type { ClubMember, ClubRole } from "./types";

type MemberRow = {
  user_id: string;
  role: ClubRole;
  display_name: string | null;
  email: string | null;
};

export async function getMember(userId: string): Promise<ClubMember | null> {
  const sql = await getSql();
  const rows = await sql<MemberRow>`
    select user_id, role, display_name, email
    from club_members
    where user_id = ${userId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.user_id,
    role: row.role,
    displayName: row.display_name,
    email: row.email,
  };
}

/**
 * First authenticated visitor becomes admin so the club can bootstrap.
 * Later visitors default to player until an admin promotes them.
 */
export async function ensureMember(
  userId: string,
  email?: string | null,
  displayName?: string | null,
): Promise<ClubMember> {
  const existing = await getMember(userId);
  if (existing) return existing;
  const sql = await getSql();
  const countRows = await sql<{ n: number }>`select count(*)::int as n from club_members`;
  const role: ClubRole = (countRows[0]?.n ?? 0) === 0 ? "admin" : "player";
  await sql`
    insert into club_members (user_id, role, display_name, email)
    values (${userId}, ${role}, ${displayName ?? null}, ${email ?? null})
  `;
  return { userId, role, displayName: displayName ?? null, email: email ?? null };
}

export function assertRole(member: ClubMember, allowed: ClubRole[]): void {
  if (!allowed.includes(member.role)) {
    const err = new Error("Action réservée aux organisateurs.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}

export async function requireStaff(
  userId: string,
  email?: string | null,
  displayName?: string | null,
): Promise<ClubMember> {
  const member = await ensureMember(userId, email, displayName);
  assertRole(member, ["admin", "organizer"]);
  return member;
}

export async function writeAudit(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  details?: unknown,
): Promise<void> {
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into audit_log (id, user_id, action, entity, entity_id, details)
    values (
      ${id},
      ${userId},
      ${action},
      ${entity},
      ${entityId},
      ${details ? JSON.stringify(details) : null}
    )
  `;
}

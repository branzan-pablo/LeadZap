export type MemberView = {
  id: string
  full_name: string
  email: string
  role: "admin" | "user"
  avatar_url: string | null
  created_at: string
}

export type InviteView = {
  id: string
  email: string
  role: "admin" | "user"
  token: string
  created_at: string
  expires_at: string
}

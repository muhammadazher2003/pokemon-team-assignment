// utils/getUserFromToken.ts
export async function getUserFromToken() {
    
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

  if (!token) return null

  try {
    console.log('hhh')
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) return null

    const data = await res.json()
    return data
  } catch (err) {
    console.error("Error fetching user:", err)
    return null
  }
}

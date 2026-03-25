const base = () => {
  const url = process.env.EVOLUTION_API_URL
  if (!url) throw new Error('EVOLUTION_API_URL is not set')
  return url.replace(/\/$/, '')
}

const headers = () => {
  const key = process.env.EVOLUTION_API_KEY
  if (!key) throw new Error('EVOLUTION_API_KEY is not set')
  return {
    apikey: key,
    'Content-Type': 'application/json',
  } as Record<string, string>
}

export async function createInstance(instanceName: string) {
  const res = await fetch(`${base()}/instance/create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ instanceName }),
  })
  if (!res.ok) throw new Error(`Evolution createInstance failed: ${res.status}`)
  return res.json() as Promise<unknown>
}

export async function getConnectQr(instanceName: string) {
  const res = await fetch(`${base()}/instance/connect/${instanceName}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Evolution connect failed: ${res.status}`)
  return res.json() as Promise<unknown>
}

export async function getConnectionState(instanceName: string) {
  const res = await fetch(`${base()}/instance/connectionState/${instanceName}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Evolution connectionState failed: ${res.status}`)
  return res.json() as Promise<unknown>
}

export async function logoutInstance(instanceName: string) {
  const res = await fetch(`${base()}/instance/logout/${instanceName}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Evolution logout failed: ${res.status}`)
  return res.json() as Promise<unknown>
}

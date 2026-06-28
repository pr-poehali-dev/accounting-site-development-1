export const API_URL = 'https://functions.poehali.dev/fb842e8f-ba05-4ef6-9b43-6beee5ff6177';

export async function createRequest(data: {
  name: string;
  phone: string;
  price?: string;
  comment?: string;
}) {
  const res = await fetch(`${API_URL}?action=create_request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('request_failed');
  return res.json();
}

export async function adminLogin(login: string, password: string) {
  const res = await fetch(`${API_URL}?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  return res.json();
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': token };
}

export async function getRequests(token: string) {
  const res = await fetch(`${API_URL}?action=requests`, { headers: authHeaders(token) });
  return res.json();
}

export async function updateRequestStatus(token: string, id: number, status: string) {
  const res = await fetch(`${API_URL}?action=update_request`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ id, status }),
  });
  return res.json();
}

export async function getAdmins(token: string) {
  const res = await fetch(`${API_URL}?action=admins`, { headers: authHeaders(token) });
  return res.json();
}

export async function addAdmin(
  token: string,
  data: { login: string; email: string; password: string }
) {
  const res = await fetch(`${API_URL}?action=add_admin`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

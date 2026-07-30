const tokenKey = "accessToken";
const tokenMaxAgeSeconds = 60 * 60;

export function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(tokenKey) || getCookieToken();
}

export function saveToken(token: string) {
  localStorage.setItem(tokenKey, token);
  document.cookie = `${tokenKey}=${encodeURIComponent(token)}; path=/; max-age=${tokenMaxAgeSeconds}; SameSite=Lax`;
}

export function clearToken() {
  localStorage.removeItem(tokenKey);
  document.cookie = `${tokenKey}=; path=/; max-age=0; SameSite=Lax`;
}

function getCookieToken() {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${tokenKey}=`))
    ?.split("=")[1] || "";
}

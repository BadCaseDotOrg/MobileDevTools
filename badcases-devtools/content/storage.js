export function getStorage() {
  return {
    local: { ...localStorage },
    session: { ...sessionStorage },
    cookies: document.cookie
  };
}
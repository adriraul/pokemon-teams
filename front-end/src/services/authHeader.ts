export default function authHeader() {
  const tokenData = localStorage.getItem("userToken");
  const token = tokenData ? tokenData : null;

  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
}

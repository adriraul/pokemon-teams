export default function authHeader() {
  const tokenData = localStorage.getItem("userToken");
  const token = tokenData ? JSON.parse(tokenData).token : null;

  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {};
  }
}

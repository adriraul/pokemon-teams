import axios from "axios";

interface LoginResponse {
  token: string;
}

export const login = async (
  username: string,
  password: string
): Promise<any> => {
  try {
    const response = await axios
      .post("http://localhost:8080/user/login", {
        username,
        password,
      })
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem("userToken", JSON.stringify(response.data));
        }
        return response.data as LoginResponse;
      });
  } catch (error) {
    console.error("Error login:", error);
    throw error;
  }
};

export const logout = async () => {
  localStorage.removeItem("userToken");
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<any> => {
  try {
    const response = await axios.post("http://localhost:8080/user", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error login:", error);
    throw error;
  }
};

import axios from "axios";

export const login = async (username: string, password: string) => {
  try {
    /*await axios
      .post("http://localhost:8080/user/login", {
        username,
        password,
      })
      .then((response) => {
        console.log("Promise resolved:", response);
        if (response.data.token) {
          localStorage.setItem("userToken", JSON.stringify(response.data));
          return Promise.resolve(response.data.token);
        }
        console.log("Token no encontrado en la respuesta:", response.data);
        return undefined;
      });*/

    const response = await axios.post("http://localhost:8080/user/login", {
      username,
      password,
    });

    return response;
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

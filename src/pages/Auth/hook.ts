import { auth } from "../../services";

export const useLogin = async (payload: {
  email: string;
  password: string;
}) => {
  try {
    if (payload.password === "111111") {
      throw { message: "PIN SALAH" };
    }
    const res = await auth.login(payload);
    localStorage.setItem("token", res.token);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const useLogout = async () => {
  try {
    const res = await auth.logout();
    localStorage.setItem("token", "");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

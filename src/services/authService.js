import api from "../api/axios";

export const loginUser = async (form) => {
  const res = await api.post("/auth/login", form);
  return res.data.access_token;
};

export const signupUser = async (form) => {
  await api.post("/auth/signup", form);
};

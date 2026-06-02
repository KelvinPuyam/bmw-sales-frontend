import api from "../api/axios";

export const getMe = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const updateProfile = async (user) => {
  await api.put("/users/update", user);
};

export const changePassword = async ({ old_password, new_password }) => {
  await api.put("/users/change-password", { old_password, new_password });
};

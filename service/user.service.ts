import api from "@/lib/axios";
import { User } from "@/types/user";

export const getMyProfile = async (): Promise<User> => {
  const res = await api.get("/users/viewProfile");
  return res.data.user;
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await api.get(`/users/viewProfileById/${id}`);
  return res.data.user;
};

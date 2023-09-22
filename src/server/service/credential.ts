import { credentialRepository } from "@/server/repository";

export const findUnique = async (userId: string) => {
  const credential = await credentialRepository.findUnique(userId);
  return credential?.privateKey ?? null;
};

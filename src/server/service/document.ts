import { cache } from "react";

import { documentRepository } from "@/server/repository";

export const findUnique = cache((documentId: string) => {
  return documentRepository.findUnique(documentId);
});

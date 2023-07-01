import { fetchJson } from "@/utils/fetchJson";

export const fetchActor = (actorId: URL) => {
  return fetchJson(actorId, {
    next: {
      revalidate: 0,
    },
    headers: {
      accept: "application/activity+json",
    },
  });
};

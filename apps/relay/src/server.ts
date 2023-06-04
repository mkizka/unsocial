import Fastify from "fastify";

import { relayActivity } from "./relay";

export const startServer = () => {
  const fastify = Fastify({
    logger: {
      transport: {
        target: "@fastify/one-line-logger",
      },
    },
  });

  fastify.post<{
    Body: {
      id?: string;
    };
  }>("/relay", (request, reply) => {
    if (!request.body.id) {
      return reply.code(400).send();
    }
    relayActivity(request.body.id);
    reply.code(202).send();
  });

  const port = Number(process.env.PORT) || 3001;
  fastify.listen({ port });
};

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
    Querystring: {
      relayId?: string;
    };
  }>("/relay", (request, reply) => {
    if (!request.query.relayId) {
      return reply.code(400).send();
    }
    relayActivity(request.query.relayId);
    reply.code(202).send();
  });

  const port = Number(process.env.PORT) || 3001;

  fastify.listen({ port });
};

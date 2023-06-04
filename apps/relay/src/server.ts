import Fastify from "fastify";

export const startServer = () => {
  const fastify = Fastify({
    logger: {
      transport: {
        target: "@fastify/one-line-logger",
      },
    },
  });

  fastify.get("/", async (request, reply) => {
    reply.type("application/json").code(200);
    return { hello: "world" };
  });

  const port = Number(process.env.PORT) || 3001;

  fastify.listen({ port });
};

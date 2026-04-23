import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.port, () => {
    // Keep startup logging minimal and explicit for container logs.
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  });
};

void bootstrap();

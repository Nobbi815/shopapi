import app from "./backend/src/app";
import { env } from "./backend/src/config/env";

const port = env.port;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Backend running locally at http://localhost:${port}`);
  });
}

export default app;
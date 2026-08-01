import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectRedis } from "./lib/redis";
import { router as usersRouter } from "./routes/users";
import { router as productsRouter } from "./routes/products";
import { router as featureFlagsRouter } from "./routes/featureFlags";
import { apiLimiter } from "./middlewares/rateLimit";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const port = Number(process.env.PORT || 8800);

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use(cors({ origin: process.env.FRONTEND_URL || "https://shop4u-gamma.vercel.app", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.get("/", (_req, res) => {
  res.json({ status: "Digitalshop API running..." });
});

app.use(usersRouter);
app.use(productsRouter);
app.use(featureFlagsRouter);

app.use(errorHandler);

connectRedis();

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Digitalshop API running at ${port}...`);
  });
}

export default app;
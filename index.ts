import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectRedis } from "./lib/redis";
import { router as usersRouter } from "./routes/users";
import { router as productsRouter } from "./routes/products";
import { router as featureFlagsRouter } from "./routes/featureFlags";
import { apiLimiter } from "./middlewares/rateLimit";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const port = Number(process.env.PORT || 8800);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
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

app.listen(port, () => {
  console.log(`Digitalshop API running at ${port}...`);
});
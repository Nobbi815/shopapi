import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/authRoutes";
import { productRouter } from "./routes/productRoutes";
import { userRouter } from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimit";
import { env } from "./config/env";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "Backend is running" });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);

app.use(errorHandler);

export default app;

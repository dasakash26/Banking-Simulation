import express from "express";
import { PORT } from "./lib/secrets";
import router from "./routes/index.routes";
import { checkAuth } from "./middleware/checkAuth.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//req logger
app.use((req, res, next) => {
  console.log(
    JSON.stringify(
      {
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params,
        body: req.body,
      },
      null,
      2
    )
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Banking Server is running...");
});

app.use("/api/v1", checkAuth, router);

app
  .listen(PORT, () => {
    console.log(`🚀 Server started successfully`);
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  });

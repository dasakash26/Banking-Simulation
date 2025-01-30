import express from "express";
import { PORT } from "./lib/secrets";
import router from "./routes/index.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//req logger
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    console.log(`📄 ${JSON.stringify(req.query)}`);
    console.log(`🔧 ${JSON.stringify(req.params)}`);
    console.log(`📝 ${JSON.stringify(req.body)}`);
    next();
});

app.get("/", (req, res) => {
    res.send("Banking Server is running...");
});

app.use("/api/v1",router);

app.listen(PORT, () => {
    console.log(`🚀 Server started successfully`);
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});

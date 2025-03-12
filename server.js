import express from "express";
import "dotenv/config";
import userRoutes from "./routes/users.js"
import formRoutes from "./routes/forms.js"

const app = express();

const PORT = process.env.PORT || 5050;
const { CORS_ORIGIN } = process.env;

app.use(express.static("public"));
app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));

//import routes
app.use("/users", userRoutes);
app.use("/:user_id/forms", formRoutes);

app.get("/", (_req, res) => {
    res.send("Hello World! We be running!");
  });
  
  app.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
  });
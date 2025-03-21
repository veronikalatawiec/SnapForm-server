import express from "express";
import cors from 'cors';
import "dotenv/config";
import userRoutes from "./routes/users.js"
import formRoutes from "./routes/forms.js"


const app = express();

const PORT = process.env.PORT || 5050;

app.use(express.static("public"));
app.use(express.json());
app.use(cors({ origin: '*', }));

//import routes
app.use("/users", userRoutes);
app.use("/forms", formRoutes);

app.get("/", (_req, res) => {
    res.send("Hello World! We be running!");
  });
  
  app.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
  });
import express, { Request, Response, Application } from "express";
import bookRoutes from "./routes/book.routes";
// Loo Express rakendus
const app: Application = express();
// Port number
const PORT: number = 3000;
// Middleware - JSON parsimiseks
app.use(express.json());
// Impordi raamatute marsruudid
app.use("/api/v1/", bookRoutes);

// Käivita server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(` GET http://localhost:${PORT}/`);
  console.log(` GET http://localhost:${PORT}/api/v1/hello`);
  console.log(` GET http://localhost:${PORT}/api/v1/greet/:name`);
});

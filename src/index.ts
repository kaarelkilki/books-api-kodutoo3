import express, { Request, Response, Application } from "express";
import bookRoutes from "./routes/book.routes";
import authorRoutes from "./routes/author.routes";
import publisherRoutes from "./routes/publisher.routes";
import reviewRoutes from "./routes/review.routes";
import genreRoutes from "./routes/genre.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Loo Express rakendus
const app: Application = express();
// Port number
const PORT: number = 3000;
// Middleware - JSON parsimiseks
app.use(express.json());
// Impordi raamatute marsruudid
app.use("/api/v1/", bookRoutes);
app.use("/api/v1/", authorRoutes);
app.use("/api/v1/", publisherRoutes);
app.use("/api/v1/", reviewRoutes);
app.use("/api/v1/", genreRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Käivita server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(` GET http://localhost:${PORT}/`);
  console.log(` GET http://localhost:${PORT}/api/v1/hello`);
  console.log(` GET http://localhost:${PORT}/api/v1/greet/:name`);
});

import e, { Request, Response, NextFunction } from "express";

// 400 veakäsitleja
export function badRequestHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err.statusCode === 400) {
    res.status(400).json({
      error: err.message || "Bad Request",
      details: err.details || [],
    });
  } else {
    next(err);
  }
}

// 404 veakäsitleja
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(404).json({
    error: "Not Found",
    details: [],
  });
}

// 409 veakäsitleja
export function conflictHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err.statusCode === 409) {
    res.status(409).json({
      error: err.message || "Conflict",
      details: err.details || [],
    });
  } else {
    next(err);
  }
}

// 500 veakäsitleja
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: err.message || "Internal Server Error",
    details: err.details || [],
  };
  res.status(statusCode).json(errorResponse);
}

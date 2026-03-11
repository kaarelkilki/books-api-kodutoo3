import { Router } from "express";
import * as publisherController from "../controllers/publisher.controller";

const router = Router();

// GET /api/v1/publishers
router.get("/publishers", publisherController.getPublishers);
// GET /api/v1/publishers/:id
router.get("/publishers/:id", publisherController.getPublisherById);
// POST /api/v1/publishers
router.post("/publishers", publisherController.addPublisher);
// PUT /api/v1/publishers/:id
router.put("/publishers/:id", publisherController.updatePublisher);
// DELETE /api/v1/publishers/:id
router.delete("/publishers/:id", publisherController.deletePublisher);

export default router;

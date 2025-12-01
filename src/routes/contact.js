import express from "express";
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";
import {
  validateContact,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// POST - submit contact form
router.post("/submit", validateContact, handleValidationErrors, submitContact);

// GET - get all contacts
router.get("/", getAllContacts);

// GET - get contact by ID
router.get("/:id", getContactById);

// PATCH - update contact status
router.patch("/:id", updateContactStatus);

// DELETE - delete contact
router.delete("/:id", deleteContact);

export default router;

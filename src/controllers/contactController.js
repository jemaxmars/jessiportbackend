import Contact from "../models/Contact.js";
import { sendContactEmail } from "../utils/emailService.js";
import logger from "../utils/logger.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // create contact record
    const contact = await Contact.create({
      name,
      email,
      message,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // send email notification asynchronously
    sendContactEmail({ name, email, message })
      .then((result) => {
        if (result.success) {
          logger.info(`Email notification sent for contact ${contact._id}`);
        } else {
          logger.error(`Failed to send email for contact ${contact._id}`);
        }
      })
      .catch((err) => {
        logger.error("Email service error", err);
      });

    res.status(201).json({
      success: true,
      message: "Message received successfully. I will get back to you soon!",
      contactId: contact._id,
    });
  } catch (error) {
    logger.error("Contact submission error", error);
    res.status(500).json({
      success: false,
      message: "Error submitting contact form",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    logger.error("Get contacts error", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    logger.error("Get contact error", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contact",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "read", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: new, read, or archived",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    logger.info(`Contact ${id} status updated to ${status}`);

    res.status(200).json({
      success: true,
      message: "Contact status updated",
      data: contact,
    });
  } catch (error) {
    logger.error("Update contact error", error);
    res.status(500).json({
      success: false,
      message: "Error updating contact",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    logger.info(`Contact ${id} deleted`);

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: contact,
    });
  } catch (error) {
    logger.error("Delete contact error", error);
    res.status(500).json({
      success: false,
      message: "Error deleting contact",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getContacts,
    createContact,
    updateContact,
    deleteContact,
} = require("../controllers/emergencyContactController");

router.use(protect);

router.get("/", getContacts);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

module.exports = router;

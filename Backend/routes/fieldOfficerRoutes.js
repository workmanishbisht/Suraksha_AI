const express = require("express");

const {
    getFieldOfficers,
    getFieldOfficerById,
    createFieldOfficer,
    updateFieldOfficer,
    deleteFieldOfficer,
    getFieldOfficerStats,
} = require("../controllers/fieldOfficerController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getFieldOfficers);

router.get("/stats", protect, getFieldOfficerStats);

router.get("/:id", protect, getFieldOfficerById);

router.post("/", protect, createFieldOfficer);

router.put("/:id", protect, updateFieldOfficer);

router.delete("/:id", protect, deleteFieldOfficer);

module.exports = router;
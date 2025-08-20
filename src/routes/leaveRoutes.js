const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const leaveController = require("../controllers/leaveController");

router.use(authenticateToken);

router.post("/addleave", leaveController.addLeave);
router.get("/getleave", leaveController.getLeave);
router.put("/updateleave/:id", leaveController.updateLeave);
router.delete("/deleteleave/:id", leaveController.deleteLeave);

module.exports = router;

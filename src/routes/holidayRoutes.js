const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const holidayController = require("../controllers/holidayController");

router.use(authenticateToken);

router.post("/addholiday", holidayController.addHoliday);
router.get("/getholiday", holidayController.getHoliday);
router.put("/updateholiday/:id", holidayController.updateHoliday);
router.delete("/deleteholiday/:id", holidayController.deleteHoliday);

module.exports = router;

const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");

router.post("/", noticeController.createNotice);
router.get("/", noticeController.getNotices);
router.put("/:id", noticeController.updateNotice);
router.delete("/:id", noticeController.deleteNotice);

module.exports = router;

const noticeService = require("../models/noticeService");

// 📌 Create
const createNotice = async (req, res) => {
  try {
    const { heading, description, createdDate, endDate } = req.body;

    if (!heading || !description || !createdDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const notice = await noticeService.createNotice(req.body);
    res.status(201).json(notice);
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Get all
const getNotices = async (req, res) => {
  try {
    const notices = await noticeService.getNotices();
    res.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Update
const updateNotice = async (req, res) => {
  try {
    const updated = await noticeService.updateNotice(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Notice not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Delete
const deleteNotice = async (req, res) => {
  try {
    await noticeService.deleteNotice(req.params.id);
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
};

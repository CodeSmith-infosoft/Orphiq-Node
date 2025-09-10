const requestService = require("../models/requestService");

const addRequest = async (req, res) => {
  try {
    const {
      attendanceId,
      date,
      clockInTime,
      clockOutTime,
      breakHours,
      reason,
    } = req.body;

    const request = await requestService.createRequest({
      attendanceId,
      date: new Date(date),
      clockInTime: new Date(`${date}T${clockInTime}:00`),
      clockOutTime: clockOutTime
        ? new Date(`${date}T${clockOutTime}:00`)
        : null,
      breakHours,
      reason,
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json({ success: false, message: "Error creating Request" });
  }
};

const getRequest = async (req, res) => {
  try {
    const currentUser = req.user;
    let logs;
    if (currentUser.isAdmin) {
      logs = await requestService.getAllRequest();
    } else {
      logs = await requestService.getRequest(currentUser.id);
    }
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("Get Request Error:", err);
    res.status(500).json({ success: false, message: "Error fetching Request" });
  }
};

module.exports = {
  addRequest,
  getRequest,
};

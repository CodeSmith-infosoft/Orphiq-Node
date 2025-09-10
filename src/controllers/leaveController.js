const leaveService = require("../models/leaveService");

exports.addLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const leave = await leaveService.createLeave({
      employeeId: parseInt(employeeId),
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    res.json({ success: true, data: leave });
  } catch (err) {
    console.error("Create Leave Error:", err);
    res.status(500).json({ success: false, message: "Error creating leave" });
  }
};

exports.getLeave = async (req, res) => {
  try {
    const currentUser = req.user;
    let leaves;
    if (currentUser.isAdmin) {
      leaves = await leaveService.allLeave();
    } else {
      leaves = await leaveService.userLeave(currentUser.id);
    }
    res.json({ success: true, data: leaves });
  } catch (err) {
    console.error("Get Leave Error:", err);
    res.status(500).json({ success: false, message: "Error fetching leaves" });
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaveType, startDate, endDate, reason, status } = req.body;

    const updated = await leaveService.updateLeave(id, {
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.message.includes("Insufficient")) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    console.error("Update Leave Error:", err);
    res.status(500).json({ success: false, message: "Error updating leave" });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    await leaveService.deleteLeave(id);

    res.json({ success: true, id: parseInt(id) });
  } catch (err) {
    console.error("Delete Leave Error:", err);
    res.status(500).json({ success: false, message: "Error deleting leave" });
  }
};

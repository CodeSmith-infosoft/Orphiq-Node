exports.addWorkLog = async (req, res) => {
  try {
    const { attendanceId, date, clockInTime, clockOutTime, breakHours, reason } = req.body;

    const workLog = await requestService.createReqest({
      attendanceId: Number(attendanceId),
      date: new Date(date),
      clockInTime: new Date(clockInTime),
      clockOutTime: clockOutTime ? new Date(clockOutTime) : null,
      breakHours,
      reason,
    });

    res.status(201).json({ success: true, data: workLog });
  } catch (err) {
    console.error("Create WorkLog Error:", err);
    res.status(500).json({ success: false, message: "Error creating WorkLog" });
  }
};

exports.getWorkLogs = async (req, res) => {
  try {
    const logs = await workLogService.getAllWorkLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("Get WorkLogs Error:", err);
    res.status(500).json({ success: false, message: "Error fetching WorkLogs" });
  }
};

exports.getWorkLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await workLogService.getWorkLogById(id);

    if (!log) {
      return res.status(404).json({ success: false, message: "WorkLog not found" });
    }

    res.json({ success: true, data: log });
  } catch (err) {
    console.error("Get WorkLog Error:", err);
    res.status(500).json({ success: false, message: "Error fetching WorkLog" });
  }
};
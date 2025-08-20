// src/controllers/attendanceController.js
const attendanceService = require("../models/attendanceService");

// Helper to calculate total minutes
function calculateTotalMinutes(inTimes, outTimes) {
  let total = 0;
  for (let i = 0; i < inTimes.length && i < outTimes.length; i++) {
    const diff = (new Date(outTimes[i]) - new Date(inTimes[i])) / 1000 / 60; // minutes
    total += diff > 0 ? diff : 0;
  }
  return Math.round(total);
}

// // Clock In
// exports.clockIn = async (req, res) => {
//   try {
//     const employeeId = req.user.userId;
//     const record = await attendanceService.createOrGetToday(employeeId);

//     const updated = await attendanceService.addClockIn(record.id, new Date());

//     res.json({ success: true, data: updated });
//   } catch (err) {
//     console.error("Clock In Error:", err);
//     res.status(500).json({ success: false, message: "Error clocking in" });
//   }
// };

// // Clock Out
// exports.clockOut = async (req, res) => {
//   try {
//     const employeeId = req.user.userId;
//     const record = await attendanceService.createOrGetToday(employeeId);

//     const updatedRecord = await attendanceService.addClockOut(
//       record.id,
//       new Date()
//     );

//     const totalWork = calculateTotalMinutes(
//       updatedRecord.clockInTimes,
//       updatedRecord.clockOutTimes
//     );

//     const finalRecord = await attendanceService.updateTotals(
//       record.id,
//       totalWork,
//       updatedRecord.totalBreakMinutes
//     );

//     res.json({ success: true, data: finalRecord });
//   } catch (err) {
//     console.error("Clock Out Error:", err);
//     res.status(500).json({ success: false, message: "Error clocking out" });
//   }
// };

// // Break In
// exports.breakIn = async (req, res) => {
//   try {
//     const employeeId = req.user.userId;
//     const record = await attendanceService.createOrGetToday(employeeId);

//     const updated = await attendanceService.addBreakIn(record.id, new Date());

//     res.json({ success: true, data: updated });
//   } catch (err) {
//     console.error("Break In Error:", err);
//     res.status(500).json({ success: false, message: "Error starting break" });
//   }
// };

// // Break Out
// exports.breakOut = async (req, res) => {
//   try {
//     const employeeId = req.user.userId;
//     const record = await attendanceService.createOrGetToday(employeeId);

//     const updatedRecord = await attendanceService.addBreakOut(
//       record.id,
//       new Date()
//     );

//     const totalBreak = calculateTotalMinutes(
//       updatedRecord.breakInTimes,
//       updatedRecord.breakOutTimes
//     );

//     const finalRecord = await attendanceService.updateTotals(
//       record.id,
//       updatedRecord.totalWorkMinutes,
//       totalBreak
//     );

//     res.json({ success: true, data: finalRecord });
//   } catch (err) {
//     console.error("Break Out Error:", err);
//     res.status(500).json({ success: false, message: "Error ending break" });
//   }
// };

// Clock In
exports.clockIn = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const { time, location } = req.body;

    const record = await attendanceService.createOrGetToday(employeeId);

    const updated = await attendanceService.addClockIn(
      record.id,
      time ? new Date(time) : new Date(),
      location || "Unknown"
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Clock In Error:", err);
    res.status(500).json({ success: false, message: "Error clocking in" });
  }
};

// Clock Out
exports.clockOut = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const { time, location } = req.body;

    const record = await attendanceService.createOrGetToday(employeeId);

    const updatedRecord = await attendanceService.addClockOut(
      record.id,
      time ? new Date(time) : new Date(),
      location || "Unknown"
    );

    const totalWork = calculateTotalMinutes(
      updatedRecord.clockInTimes,
      updatedRecord.clockOutTimes
    );

    const finalRecord = await attendanceService.updateTotals(
      record.id,
      totalWork,
      updatedRecord.totalBreakMinutes
    );

    res.json({ success: true, data: finalRecord });
  } catch (err) {
    console.error("Clock Out Error:", err);
    res.status(500).json({ success: false, message: "Error clocking out" });
  }
};

// Break In
exports.breakIn = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const { time, location } = req.body;

    const record = await attendanceService.createOrGetToday(employeeId);

    const updated = await attendanceService.addBreakIn(
      record.id,
      time ? new Date(time) : new Date(),
      location || "Unknown"
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Break In Error:", err);
    res.status(500).json({ success: false, message: "Error starting break" });
  }
};

// Break Out
exports.breakOut = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const { time, location } = req.body;

    const record = await attendanceService.createOrGetToday(employeeId);

    const updatedRecord = await attendanceService.addBreakOut(
      record.id,
      time ? new Date(time) : new Date(),
      location || "Unknown"
    );

    const totalBreak = calculateTotalMinutes(
      updatedRecord.breakInTimes,
      updatedRecord.breakOutTimes
    );

    const finalRecord = await attendanceService.updateTotals(
      record.id,
      updatedRecord.totalWorkMinutes,
      totalBreak
    );

    res.json({ success: true, data: finalRecord });
  } catch (err) {
    console.error("Break Out Error:", err);
    res.status(500).json({ success: false, message: "Error ending break" });
  }
};

// Get today's attendance
exports.getToday = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const record = await attendanceService.getByDate(employeeId, new Date());

    res.json({ success: true, data: record });
  } catch (err) {
    console.error("Get Today Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching today's attendance" });
  }
};

// Get all attendance for employee
exports.getAll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await attendanceService.getAllForEmployee(
      Number(employeeId)
    );

    res.json({ success: true, data: records });
  } catch (err) {
    console.error("Get All Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching attendance" });
  }
};

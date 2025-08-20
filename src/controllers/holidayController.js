const holidayService = require("../models/holidayService");

exports.addHoliday = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    const holiday = await holidayService.createHoliday({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.json({ success: true, data: holiday });
  } catch (err) {
    console.error("Create Holiday Error:", err);
    res.status(500).json({ success: false, message: "Error creating holiday" });
  }
};

exports.getHoliday = async (req, res) => {
  try {
    const holiday = await holidayService.allHoliday();
    res.json({ success: true, data: holiday });
  } catch (err) {
    console.error("Get Holiday Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching holidays" });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;

    const updated = await holidayService.updateHoliday(id, {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update Holiday Error:", err);
    res.status(500).json({ success: false, message: "Error updating holiday" });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    await holidayService.deleteHoliday(id);

    res.json({ success: true, id: parseInt(id) });
  } catch (err) {
    console.error("Delete Holiday Error:", err);
    res.status(500).json({ success: false, message: "Error deleting holiday" });
  }
};

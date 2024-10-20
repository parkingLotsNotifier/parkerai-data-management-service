const SchedulerTask = require("../models/SchedulerTask");

// Save a new Scheduler Task
exports.saveSchedulerTaskHandler = async (req, res) => {
  const task = req.body;
  try {
    const scheduledTask = new SchedulerTask(task.query);
    await scheduledTask.save();
    return res.status(200).json({ message: "Task has been saved" });
  } catch (error) {
    return res.status(500).json({ message: "Error on saveSchedulerTask", error: error.message });
  }
};

// Delete a Scheduler Task
exports.deleteScheduleTaskHandler = async (req, res) => {
  const { parkingLotId } = req.params;
  try {
    const deletedTask = await SchedulerTask.deleteMany( {parkingLotId} );
    if (deletedTask) {
      return res.status(200).json({ message: "Task deleted" });
    } else {
      return res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error on deleteScheduleTaskHandler", error: error.message });
  }
};

// Get all Scheduler Tasks
exports.getAllScheduleTaskHandler = async (req, res) => {
  try {
    const allSchedulerTasks = await SchedulerTask.find({});
    return res.status(200).json(allSchedulerTasks);
  } catch (error) {
    return res.status(500).json({ message: "Error on getAllScheduleTaskHandler", error: error.message });
  }
};



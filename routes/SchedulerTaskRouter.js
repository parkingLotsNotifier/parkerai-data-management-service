const express = require("express");
const schedulerTaskController = require("../controllers/schedulerTaskController");
const router = express.Router();

router.post("/saveSchedulerTask",schedulerTaskController.saveSchedulerTaskHandler);
router.delete("/deleteSchedulerTask/:parkingLotId",schedulerTaskController.deleteScheduleTaskHandler);
router.get("/getAllSchedulerTask",schedulerTaskController.getAllScheduleTaskHandler);

module.exports = router;
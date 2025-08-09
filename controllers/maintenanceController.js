const maintenanceModel = require("../models/maintenanceModel");

function validateScheduleInput(body) {
  const errors = [];
  const required = ["customer_name","vehicle_make","vehicle_model","task_id","due_date"];
  for (const f of required) if (!body[f] || String(body[f]).trim() === "") errors.push(`${f} is required.`);
  if (body.odometer_km && Number(body.odometer_km) < 0) errors.push("odometer_km must be >= 0.");
  // Basic date sanity
  if (body.due_date && isNaN(Date.parse(body.due_date))) errors.push("due_date is invalid.");
  // Status sanity
  if (body.status && !["Scheduled","Completed","Cancelled"].includes(body.status)) errors.push("Invalid status.");
  return errors;
}

module.exports = {
  // LIST
  async buildList(req, res) {
    try {
      const { status, from, to, q } = req.query;
      const [schedules, tasks] = await Promise.all([
        maintenanceModel.listSchedules({ status, from, to, q }),
        maintenanceModel.listTasks()
      ]);
      res.render("maintenance/list", {
        title: "Maintenance Schedule",
        schedules, tasks,
        filters: { status, from, to, q },
        notice: req.flash("notice")
      });
    } catch (err) {
      console.error("buildList error:", err);
      req.flash("notice", "Unable to load schedules.");
      res.status(500).render("errors/500", { title: "Server Error" });
    }
  },

  // CREATE (GET)
  async showCreate(req, res) {
    try {
      const tasks = await maintenanceModel.listTasks();
      res.render("maintenance/create", {
        title: "New Maintenance Schedule",
        tasks, data: {}, errors: []
      });
    } catch (err) {
      console.error("showCreate error:", err);
      req.flash("notice", "Unable to load form.");
      res.status(500).render("errors/500", { title: "Server Error" });
    }
  },

  // CREATE (POST)
  async create(req, res) {
    try {
      const data = { ...req.body };
      const errors = validateScheduleInput(data);
      if (errors.length) {
        const tasks = await maintenanceModel.listTasks();
        return res.status(400).render("maintenance/create", {
          title: "New Maintenance Schedule", tasks, data, errors
        });
      }
      const created_by = req?.session?.account_id || null;
      await maintenanceModel.createSchedule({ ...data, created_by });
      req.flash("notice", "Schedule created.");
      res.redirect("/maintenance");
    } catch (err) {
      console.error("create error:", err);
      req.flash("notice", "Could not create schedule.");
      res.status(500).render("errors/500", { title: "Server Error" });
    }
  },

  // EDIT (GET)
  async showEdit(req, res) {
    try {
      const ms_id = Number(req.params.ms_id);
      const [row, tasks] = await Promise.all([
        maintenanceModel.getScheduleById(ms_id),
        maintenanceModel.listTasks()
      ]);
      if (!row) {
        req.flash("notice", "Schedule not found.");
        return res.redirect("/maintenance");
      }
      res.render("maintenance/edit", {
        title: "Edit Maintenance Schedule",
        tasks, data: row, errors: []
      });
    } catch (err) {
      console.error("showEdit error:", err);
      req.flash("notice", "Unable to load edit form.");
      res.status(500).render("errors/500", { title: "Server Error" });
    }
  },

  // EDIT (POST)
  async update(req, res) {
    try {
      const ms_id = Number(req.params.ms_id);
      const data = { ...req.body };
      const errors = validateScheduleInput({ ...data, status: data.status || "Scheduled" });
      if (errors.length) {
        const tasks = await maintenanceModel.listTasks();
        return res.status(400).render("maintenance/edit", {
          title: "Edit Maintenance Schedule", tasks, data: { ...data, ms_id }, errors
        });
      }
      await maintenanceModel.updateSchedule(ms_id, data);
      req.flash("notice", "Schedule updated.");
      res.redirect("/maintenance");
    } catch (err) {
      console.error("update error:", err);
      req.flash("notice", "Could not update schedule.");
      res.status(500).render("errors/500", { title: "Server Error" });
    }
  },

  // DELETE
  async remove(req, res) {
    try {
      const ms_id = Number(req.params.ms_id);
      await maintenanceModel.deleteSchedule(ms_id);
      req.flash("notice", "Schedule deleted.");
      res.redirect("/maintenance");
    } catch (err) {
      console.error("delete error:", err);
      req.flash("notice", "Could not delete schedule.");
      res.status(500).render("errors/500", { title: "Server Error" });
    }
  }
};
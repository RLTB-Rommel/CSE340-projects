const pool = require("../database");

module.exports = {
  // ===== TASKS =====
  async listTasks() {
    const { rows } = await pool.query(
      "SELECT * FROM maintenance_task WHERE is_active = TRUE ORDER BY name"
    );
    return rows;
  },

  async getTaskById(task_id) {
    const { rows } = await pool.query(
      "SELECT * FROM maintenance_task WHERE task_id = $1",
      [task_id]
    );
    return rows[0];
  },

  // ===== SCHEDULES =====
  async listSchedules({ status, from, to, q } = {}) {
    const params = [];
    const where = [];

    if (status) { params.push(status); where.push(`ms.status = $${params.length}`); }
    if (from)   { params.push(from);   where.push(`ms.due_date >= $${params.length}`); }
    if (to)     { params.push(to);     where.push(`ms.due_date <= $${params.length}`); }
    if (q) {
      params.push(`%${q}%`);
      where.push(
        `(ms.customer_name ILIKE $${params.length} OR ms.vehicle_make ILIKE $${params.length} OR ms.vehicle_model ILIKE $${params.length} OR ms.plate_no ILIKE $${params.length})`
      );
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT
        ms.ms_id,
        ms.customer_name,
        ms.customer_contact,
        ms.vehicle_make,
        ms.vehicle_model,
        ms.plate_no,
        ms.odometer_km,
        ms.task_id,
        to_char(ms.due_date, 'YYYY-MM-DD') AS due_date, -- return as string for EJS
        ms.status,
        ms.notes,
        ms.created_by,
        ms.created_at,
        ms.updated_at,
        t.name AS task_name
      FROM maintenance_schedule ms
      JOIN maintenance_task t ON t.task_id = ms.task_id
      ${whereSql}
      ORDER BY ms.due_date ASC, ms.ms_id DESC
    `;

    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async getScheduleById(ms_id) {
    const { rows } = await pool.query(
      `
      SELECT
        ms.ms_id,
        ms.customer_name,
        ms.customer_contact,
        ms.vehicle_make,
        ms.vehicle_model,
        ms.plate_no,
        ms.odometer_km,
        ms.task_id,
        to_char(ms.due_date, 'YYYY-MM-DD') AS due_date, -- return as string for EJS
        ms.status,
        ms.notes,
        ms.created_by,
        ms.created_at,
        ms.updated_at,
        t.name AS task_name
      FROM maintenance_schedule ms
      JOIN maintenance_task t ON t.task_id = ms.task_id
      WHERE ms.ms_id = $1
      `,
      [ms_id]
    );
    return rows[0];
  },

  async createSchedule(payload) {
    const {
      customer_name,
      customer_contact,
      vehicle_make,
      vehicle_model,
      plate_no,
      odometer_km,
      task_id,
      due_date,
      notes,
      created_by
    } = payload;

    const sql = `
      INSERT INTO maintenance_schedule
        (customer_name, customer_contact, vehicle_make, vehicle_model, plate_no,
         odometer_km, task_id, due_date, status, notes, created_by)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,'Scheduled',$9,$10)
      RETURNING ms_id
    `;

    const params = [
      customer_name,
      customer_contact ?? null,
      vehicle_make,
      vehicle_model,
      plate_no ?? null,
      odometer_km ?? null,
      task_id,
      due_date,            // expects 'YYYY-MM-DD'
      notes ?? null,
      created_by ?? null
    ];

    const { rows } = await pool.query(sql, params);
    return rows[0];
  },

  async updateSchedule(ms_id, payload) {
    const {
      customer_name,
      customer_contact,
      vehicle_make,
      vehicle_model,
      plate_no,
      odometer_km,
      task_id,
      due_date,
      status,
      notes
    } = payload;

    const sql = `
      UPDATE maintenance_schedule
      SET customer_name = $1,
          customer_contact = $2,
          vehicle_make = $3,
          vehicle_model = $4,
          plate_no = $5,
          odometer_km = $6,
          task_id = $7,
          due_date = $8,
          status = $9,
          notes = $10,
          updated_at = NOW()
      WHERE ms_id = $11
      RETURNING ms_id
    `;

    const params = [
      customer_name,
      customer_contact ?? null,
      vehicle_make,
      vehicle_model,
      plate_no ?? null,
      odometer_km ?? null,
      task_id,
      due_date,            // expects 'YYYY-MM-DD'
      status,
      notes ?? null,
      ms_id
    ];

    const { rows } = await pool.query(sql, params);
    return rows[0];
  },

  async deleteSchedule(ms_id) {
    await pool.query("DELETE FROM maintenance_schedule WHERE ms_id = $1", [ms_id]);
  }
};
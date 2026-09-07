// GET /api/hydro
// Returns { stations: { "<station_id>": { readings: [{ time, discharge_m3s, water_level_m, water_temp_c }] } } }
// matching the frontend's original static-JSON contract (field name "time", full history
// since the vertical-bar min/max is computed "seit Beginn der Aufzeichnung").
const STATIONS = ["2043", "2288", "2415"];

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT station_id, reading_time, discharge_m3s, water_level_m, water_temp_c
       FROM hydro_readings
       ORDER BY reading_time ASC`
    ).all();

    const stations = {};
    for (const id of STATIONS) stations[id] = { readings: [] };

    for (const row of results) {
      if (!stations[row.station_id]) continue;
      stations[row.station_id].readings.push({
        time: row.reading_time,
        discharge_m3s: row.discharge_m3s,
        water_level_m: row.water_level_m,
        water_temp_c: row.water_temp_c,
      });
    }

    return Response.json({ stations }, {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

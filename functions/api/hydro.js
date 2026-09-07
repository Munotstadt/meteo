// GET /api/hydro?days=30
// Returns latest reading + recent history per station, grouped by station name.
const STATIONS = {
  "2043": { name: "Bodensee", place: "Berlingen" },
  "2288": { name: "Rhein", place: "Neuhausen" },
  "2415": { name: "Glatt", place: "Rheinsfelden" },
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get("days") || "30", 10) || 30, 3650);

  try {
    const { results } = await env.DB.prepare(
      `SELECT station_id, reading_time, discharge_m3s, water_level_m, water_temp_c
       FROM hydro_readings
       WHERE reading_time >= datetime('now', ?)
       ORDER BY reading_time ASC`
    ).bind(`-${days} days`).all();

    const byStation = {};
    for (const id of Object.keys(STATIONS)) {
      byStation[id] = { ...STATIONS[id], station_id: id, readings: [] };
    }
    for (const row of results) {
      if (byStation[row.station_id]) byStation[row.station_id].readings.push(row);
    }
    for (const id of Object.keys(byStation)) {
      const r = byStation[id].readings;
      byStation[id].latest = r.length ? r[r.length - 1] : null;
    }

    return Response.json(Object.values(byStation), {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

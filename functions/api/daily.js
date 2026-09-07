// GET /api/daily
// Returns { days: [...] } — full daily KLO history, ascending by date,
// with field name "date" (matching the frontend's original static-JSON contract).
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT obs_date, temp_mean_c, temp_min_c, temp_max_c, precip_mm,
              sunshine_min, radiation_wm2, wind_mean_kmh, wind_max_kmh, humidity_pct
       FROM meteo_klo_daily
       ORDER BY obs_date ASC`
    ).all();

    const days = results.map((r) => ({
      date: r.obs_date,
      temp_mean_c: r.temp_mean_c,
      temp_min_c: r.temp_min_c,
      temp_max_c: r.temp_max_c,
      precip_mm: r.precip_mm,
      sunshine_min: r.sunshine_min,
      radiation_wm2: r.radiation_wm2,
      wind_mean_kmh: r.wind_mean_kmh,
      wind_max_kmh: r.wind_max_kmh,
      humidity_pct: r.humidity_pct,
    }));

    return Response.json({ days }, {
      headers: { "cache-control": "public, max-age=600" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

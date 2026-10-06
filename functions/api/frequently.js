// GET /api/frequently?hours=48
// Returns the raw 10-minute KLO rows (obs_datetime_utc is UTC, no "Z" suffix)
// for the last N hours, oldest first.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const hours = Math.min(parseInt(url.searchParams.get("hours") || "48", 10) || 48, 24 * 14);
  const limit = hours * 6;

  try {
    const { results } = await env.DB.prepare(
      `SELECT obs_datetime_utc, temp_c, humidity_pct, pressure_qff_hpa,
              wind_mean_kmh, wind_gust_kmh, wind_dir_deg,
              precip_mm, radiation_wm2, sunshine_min
       FROM meteo_klo_frequently
       ORDER BY obs_datetime_utc DESC
       LIMIT ?`
    ).bind(limit).all();

    return Response.json(results.reverse(), {
      headers: { "cache-control": "public, max-age=120" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

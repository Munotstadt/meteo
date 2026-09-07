// GET /api/hourly?hours=72
// Returns hourly KLO rows for the last N hours, most recent last.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const hours = Math.min(parseInt(url.searchParams.get("hours") || "72", 10) || 72, 24 * 366);

  try {
    const { results } = await env.DB.prepare(
      `SELECT obs_datetime, temp_mean_c, precip_mm, radiation_wm2,
              wind_mean_kmh, wind_max_kmh, humidity_pct, sunshine_min
       FROM meteo_klo_hourly
       ORDER BY obs_datetime DESC
       LIMIT ?`
    ).bind(hours).all();

    return Response.json(results.reverse(), {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

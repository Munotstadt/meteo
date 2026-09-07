// GET /api/daily?days=30
// Returns daily KLO climatology rows, most recent last (chart-friendly order).
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get("days") || "30", 10) || 30, 3650);

  try {
    const { results } = await env.DB.prepare(
      `SELECT obs_date, temp_mean_c, temp_min_c, temp_max_c, precip_mm,
              sunshine_min, radiation_wm2, wind_mean_kmh, wind_max_kmh, humidity_pct
       FROM meteo_klo_daily
       ORDER BY obs_date DESC
       LIMIT ?`
    ).bind(days).all();

    return Response.json(results.reverse(), {
      headers: { "cache-control": "public, max-age=600" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

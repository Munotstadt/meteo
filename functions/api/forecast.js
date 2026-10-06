// GET /api/forecast
// Returns { fetched_at, rows } — hourly forecast from today (Europe/Zurich) onward, ascending.
// Row format: [forecast_time, shortwave_radiation, cloud_cover, temperature_2m,
//              precipitation, wind_speed_10m, weather_code]
export async function onRequestGet({ env }) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());

  try {
    const { results } = await env.DB.prepare(
      `SELECT forecast_time, shortwave_radiation, cloud_cover, temperature_2m,
              precipitation, wind_speed_10m, weather_code, fetched_at
       FROM meteo_forecast
       WHERE forecast_time >= ?
       ORDER BY forecast_time ASC`
    ).bind(today).all();

    const rows = results.map((r) => [
      r.forecast_time,
      r.shortwave_radiation,
      r.cloud_cover,
      r.temperature_2m,
      r.precipitation,
      r.wind_speed_10m,
      r.weather_code,
    ]);
    const fetched_at = results.reduce((m, r) => (r.fetched_at > m ? r.fetched_at : m), "") || null;

    return Response.json({ fetched_at, rows }, {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

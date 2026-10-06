// GET /api/frequently-daily
// Returns { days: [...] } — daily aggregates built from the 10-minute table
// meteo_klo_frequently, grouped by calendar day in Europe/Zurich (00:00–24:00 local).
// Field names match /api/daily so the frontend can reuse its comparison code.
// "n" is the number of 10-minute samples in the day (144 = complete).
// Covers the previous year's December onward (enough for 7-day / previous-week /
// month / YTD comparisons across a year boundary).

// Last Sunday of the given month (monthIndex 0-based) as a UTC Date at 01:00.
function lastSundayAt01Utc(year, monthIndex) {
  const d = new Date(Date.UTC(year, monthIndex + 1, 0, 1, 0, 0));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}
const iso = (d) => d.toISOString().slice(0, 19);
const round2 = (v) => (v == null ? null : Math.round(v * 100) / 100);

export async function onRequestGet({ env }) {
  const year = new Date().getUTCFullYear();
  const [y0, y1] = [year - 1, year];
  // EU summer time: last Sunday of March 01:00 UTC until last Sunday of October 01:00 UTC.
  const dst = [y0, y1].flatMap((y) => [iso(lastSundayAt01Utc(y, 2)), iso(lastSundayAt01Utc(y, 9))]);
  const from = `${y0}-12-01T00:00:00`;

  try {
    const { results } = await env.DB.prepare(
      `SELECT date(obs_datetime_utc,
                   CASE WHEN (obs_datetime_utc >= ? AND obs_datetime_utc < ?)
                          OR (obs_datetime_utc >= ? AND obs_datetime_utc < ?)
                        THEN '+2 hours' ELSE '+1 hour' END) AS d,
              COUNT(*)            AS n,
              AVG(temp_c)         AS temp_mean_c,
              MIN(temp_c)         AS temp_min_c,
              MAX(temp_c)         AS temp_max_c,
              SUM(precip_mm)      AS precip_mm,
              SUM(sunshine_min)   AS sunshine_min,
              AVG(radiation_wm2)  AS radiation_wm2,
              AVG(wind_mean_kmh)  AS wind_mean_kmh,
              MAX(wind_gust_kmh)  AS wind_max_kmh,
              AVG(humidity_pct)   AS humidity_pct
       FROM meteo_klo_frequently
       WHERE obs_datetime_utc >= ?
       GROUP BY d
       ORDER BY d ASC`
    ).bind(...dst, from).all();

    const days = results.map((r) => ({
      date: r.d,
      n: r.n,
      temp_mean_c: round2(r.temp_mean_c),
      temp_min_c: r.temp_min_c,
      temp_max_c: r.temp_max_c,
      precip_mm: round2(r.precip_mm),
      sunshine_min: round2(r.sunshine_min),
      radiation_wm2: round2(r.radiation_wm2),
      wind_mean_kmh: round2(r.wind_mean_kmh),
      wind_max_kmh: r.wind_max_kmh,
      humidity_pct: round2(r.humidity_pct),
    }));

    return Response.json({ days }, {
      headers: { "cache-control": "public, max-age=300" },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

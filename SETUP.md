# Setup: meteo.munot.app auf Cloudflare Pages

## 1. Repo umbenennen
GitHub → `Munotstadt/meteodatacollector` → Settings → Rename to `meteo`.
(Alte URLs redirecten automatisch, aber Actions-Badges/Links ggf. anpassen.)

## 2. Cloudflare Pages Projekt anlegen (einmalig, per CLI-Deploy)
Statt Dashboard-Git-Integration: Deploy über GitHub Actions + `wrangler`. Das Projekt `meteo` wird beim ersten `wrangler pages deploy` automatisch angelegt, falls es noch nicht existiert.

**Secrets im Repo (Settings → Secrets and variables → Actions):**
- `CLOUDFLARE_API_TOKEN` — Token mit Berechtigung "Cloudflare Pages: Edit" (und "D1: Read" falls nötig), erstellbar unter dash.cloudflare.com → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID` — steht im Cloudflare Dashboard rechts auf der Overview-Seite jeder Domain/Zone

Bei jedem Push auf `main` deployt `.github/workflows/deploy.yml` automatisch via `wrangler pages deploy . --project-name=meteo`. Kein CLI auf dem iPad nötig — läuft komplett in GitHub Actions.

## 3. D1 Binding
Bereits in `wrangler.toml` definiert (Binding-Name `DB` → `munotstadtmeteodb`). Wird beim Deploy automatisch übernommen, kein manueller Dashboard-Schritt nötig.

## 4. Custom Domain
Pages-Projekt → Custom domains → Add → `meteo.munot.app`.
Voraussetzung: Zone `munot.app` muss auf Cloudflare liegen (DNS-Nameserver zeigen auf Cloudflare) — sonst zuerst die Domain/Zone in Cloudflare hinzufügen.

## 5. Google-Auth via Cloudflare Access
Zero Trust Dashboard → Settings → Authentication → Login methods → Google hinzufügen (falls noch nicht vorhanden, OAuth-Client-ID/Secret aus Google Cloud Console nötig).
Dann: Access → Applications → Add an application → Self-hosted:
- Domain: `meteo.munot.app`
- Policy: Allow, Include → Emails → deine Google-Adresse(n)

Damit ist die gesamte Domain hinter Google-Login, ganz ohne Code in der App.

## Was noch fehlt (nächste Schritte)
- `sommer.html` (Sommervergleich-Seite) — folgt als nächstes Deliverable
- Collector-Skripte laufen laut dir schon gegen D1 — ggf. `collect-turso.yml` → `collect-d1.yml` umbenennen, falls Name noch alt ist

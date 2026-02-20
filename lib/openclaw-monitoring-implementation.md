# Convex Monitoring — Implementation Notes

This file documents the data wiring plan for the Monitoring & Analytics section of Mission Control.

## Sources (Convex)
- `metrics` table: aggregated usage + latency
- `agents` table: per-agent usage + status
- `interactions` table: activity feed

## Mapping
- `MonitoringData.totals` ← aggregated metrics rows
- `MonitoringData.byProvider` ← metrics grouped by provider
- `MonitoringData.byModel` ← metrics grouped by model
- `MonitoringData.tools` ← tool usage counts
- `MonitoringData.skills` ← skill context usage
- `MonitoringData.daily` ← daily aggregation
- `MonitoringData.latency` ← avg/p95/min/max

## Next Steps
- Replace mock data in `lib/store.ts` with Convex aggregations
- Add Convex actions/collectors to ingest OpenClaw + filesystem

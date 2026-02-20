#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OpenClaw → Convex Sync Script
# Runs on EC2 via cron, pushes agent status
# and usage metrics to Convex HTTP endpoints.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# === CONFIGURE THESE ===
CONVEX_SITE_URL="${CONVEX_SITE_URL:-https://steady-marlin-608.convex.site}"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:3578}"

# ━━━ Sync Agent Status ━━━
sync_agents() {
  echo "[$(date)] Syncing agents..."
  
  # Get agent status from Gateway (adjust endpoint to your Gateway's actual API)
  AGENTS_JSON=$(curl -s "${GATEWAY_URL}/api/agents" 2>/dev/null || echo "[]")
  
  if [ "$AGENTS_JSON" = "[]" ]; then
    echo "  No agents data from Gateway, skipping..."
    return
  fi
  
  # Parse and push each agent
  echo "$AGENTS_JSON" | jq -c '.[]' 2>/dev/null | while read -r agent; do
    AGENT_ID=$(echo "$agent" | jq -r '.id // .agentId // .name' | tr '[:upper:]' '[:lower:]')
    STATUS=$(echo "$agent" | jq -r '.status // "idle"')
    CURRENT_TASK=$(echo "$agent" | jq -r '.currentTask // .current_task // ""')
    TOKENS=$(echo "$agent" | jq -r '.tokensToday // .tokens_today // 0')
    
    curl -s -X POST "${CONVEX_SITE_URL}/sync/agent-status" \
      -H "Content-Type: application/json" \
      -d "{
        \"agentId\": \"${AGENT_ID}\",
        \"status\": \"${STATUS}\",
        \"currentTask\": \"${CURRENT_TASK}\",
        \"tokensToday\": ${TOKENS}
      }" > /dev/null 2>&1
    
    echo "  ✓ ${AGENT_ID}: ${STATUS}"
  done
}

# ━━━ Sync Daily Usage Snapshot ━━━
sync_usage() {
  echo "[$(date)] Syncing daily usage..."
  
  TODAY=$(date +%Y-%m-%d)
  
  # Get usage from Gateway metrics endpoint (adjust to your Gateway's actual API)
  USAGE_JSON=$(curl -s "${GATEWAY_URL}/api/usage" 2>/dev/null || echo "{}")
  
  if [ "$USAGE_JSON" = "{}" ]; then
    echo "  No usage data, sending zero snapshot..."
    USAGE_JSON='{"inputTokens":0,"outputTokens":0,"cacheReadTokens":0,"cacheWriteTokens":0,"totalTokens":0,"totalCost":0}'
  fi
  
  # Push to Convex
  curl -s -X POST "${CONVEX_SITE_URL}/sync/usage-snapshot" \
    -H "Content-Type: application/json" \
    -d "{
      \"date\": \"${TODAY}\",
      $(echo "$USAGE_JSON" | jq -r 'to_entries | map("\(.key | @json): \(.value)") | join(", ")')
    }" > /dev/null 2>&1
  
  echo "  ✓ usage snapshot for ${TODAY}"
}

# ━━━ Log Events ━━━
sync_events() {
  echo "[$(date)] Syncing recent events..."
  
  EVENTS_JSON=$(curl -s "${GATEWAY_URL}/api/events?since=5m" 2>/dev/null || echo "[]")
  
  if [ "$EVENTS_JSON" = "[]" ]; then
    echo "  No new events"
    return
  fi
  
  echo "$EVENTS_JSON" | jq -c '.[]' 2>/dev/null | while read -r event; do
    curl -s -X POST "${CONVEX_SITE_URL}/sync/event" \
      -H "Content-Type: application/json" \
      -d "$event" > /dev/null 2>&1
  done
  
  COUNT=$(echo "$EVENTS_JSON" | jq '. | length' 2>/dev/null || echo "0")
  echo "  ✓ ${COUNT} events synced"
}

# ━━━ Health Check ━━━
check_health() {
  HEALTH=$(curl -s "${CONVEX_SITE_URL}/health" 2>/dev/null)
  echo "[$(date)] Convex health: $HEALTH"
}

# ━━━ Main ━━━
echo "=========================================="
echo "  OpenClaw → Convex Sync"
echo "  Site: ${CONVEX_SITE_URL}"
echo "  Gateway: ${GATEWAY_URL}"
echo "=========================================="

check_health
sync_agents
sync_usage
sync_events

echo "[$(date)] ✅ Sync complete"

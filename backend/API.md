# Backend API Reference

This document describes the HTTP, Socket.IO, and MQTT interfaces implemented by `backend/src`.

## Contents

- [Base URL and conventions](#base-url-and-conventions)
- [Telemetry](#telemetry)
- [Actuators](#actuators)
- [Dosing](#dosing)
- [Crop recipes](#crop-recipes)
- [Vision](#vision)
- [System and devices](#system-and-devices)
- [Uploaded files](#uploaded-files)
- [Socketio events](#socketio-events)
- [MQTT device interface](#mqtt-device-interface)
- [Implementation notes](#implementation-notes)

## Base URL and conventions

By default, the HTTP server listens at `http://localhost:3000`. Set `PORT` to change the port. All REST API routes are below `/api`; requests and responses use JSON except for image uploads. CORS currently allows all origins, and the backend does not implement HTTP authentication or authorization.

Unless otherwise noted, successful JSON responses include `success: true`. Most failures use `{ "success": false, "error": "..." }`; some not-found responses use `message` instead. Error response shapes are therefore not fully uniform. Dates returned from PostgreSQL and InfluxDB are ISO-8601 timestamps. Device IDs default to `esp32_node_01` on routes that document that default.

## Telemetry

### `GET /api/telemetry/latest`

Return the latest telemetry record for one device. The query searches up to the previous seven days in InfluxDB.

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `deviceId` | string | `esp32_node_01` | Device identifier. |

Success `200`:

```json
{
  "success": true,
  "data": {
    "timestamp": "2026-09-27T12:00:00.000Z",
    "device_id": "esp32_node_01",
    "circulation_pump_state": "ON",
    "sensors": {
      "ph": 6.1,
      "ec_ms_cm": 1.5,
      "water_temp_c": 22.8,
      "water_level_pct": 82
    }
  }
}
```

`data` sensor values may be `null` when absent in the stored point. `circulation_pump_state` falls back to `circulation_pump`, and then to `ON`.

Errors: `404` when no record is found; `500` for an InfluxDB/query failure.

### `GET /api/telemetry/history`

Return ascending, time-window-averaged telemetry points for charting.

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `deviceId` | string | `esp32_node_01` | Device identifier. |
| `range` | string | `24h` | Allowed values: `15m`, `1h`, `6h`, `24h`, `7d`, `30d`. |
| `interval` | string | Range-dependent | Aggregation duration. Defaults: `10s` for `15m`; `1m` for `1h`; `5m` for `6h`; `15m` for `24h`; `1h` for `7d`; `6h` for `30d`. If provided, the value is inserted into the Influx query and must be a valid Flux duration. |

Success `200`:

```json
{
  "success": true,
  "range": "24h",
  "count": 1,
  "data": [
    {
      "timestamp": "2026-09-27T12:00:00.000Z",
      "device_id": "esp32_node_01",
      "ph": 6.1,
      "ec_ms_cm": 1.5,
      "water_temp_c": 22.8,
      "water_level_pct": 82
    }
  ]
}
```

Missing sensor values in a point are `null`. Invalid `range` returns `400` and lists the allowed ranges. Query failures return `500`.

## Actuators

### `POST /api/actuators/manual-pulse`

Dispatch a manual nutrient or pH-down pump pulse. The command is published to MQTT, recorded in the dosing log, and broadcast to connected Socket.IO clients. A per-device mixing lockout is applied after dispatch.

JSON body:

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceId` | string | No | Target device; defaults to `esp32_node_01`. |
| `pumpType` | enum | Yes | `PH_DOWN`, `NUTRIENT_A`, or `NUTRIENT_B`. |
| `durationMs` | integer | Yes | Parsed as an integer; implementation accepts values greater than `0` through `5000`. |

Example:

```json
{
  "deviceId": "esp32_node_01",
  "pumpType": "PH_DOWN",
  "durationMs": 800
}
```

Success `200` returns `{ "success": true, "message": "...", "data": <DosingLog> }`. A dosing log contains `id`, `deviceId`, `timestamp`, `source`, `pumpType`, `durationMs`, `rationale`, `mixingLockoutMin`, and optional `diagnosticReportId`.

Errors: `400` for an invalid pump or duration; `429` while the 10-minute mixing lockout is active; `500` for a database or dispatch-path failure. Note: the current validation error text says `100ms` minimum, but the actual check accepts any positive integer, including values below 100.

### `POST /api/actuators/circulation`

Set the circulation pump schedule for an existing device. The command is published to `hydro/{deviceId}/circulation/set`; the server also broadcasts `circulation:update` over Socket.IO.

JSON body:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `deviceId` | string | `esp32_node_01` | Existing device identifier. |
| `mode` | enum | `CONTINUOUS` | `CONTINUOUS`, `INTERVAL`, or `OFF`. |
| `runMin` | integer | `15` | Required to be positive for `INTERVAL`. |
| `restMin` | integer | `15` | Required to be positive for `INTERVAL`. |

Example:

```json
{
  "deviceId": "esp32_node_01",
  "mode": "INTERVAL",
  "runMin": 15,
  "restMin": 10
}
```

Success `200`:

```json
{
  "success": true,
  "message": "Circulation schedule updated to INTERVAL",
  "data": {
    "deviceId": "esp32_node_01",
    "mode": "INTERVAL",
    "run_min": 15,
    "rest_min": 10,
    "timestamp": 1790510400000
  }
}
```

For `CONTINUOUS` and `OFF`, `run_min` and `rest_min` are sent as `0`. Errors: `400` for an unsupported mode or non-positive interval; `404` if the device does not exist; `500` if publishing fails.

## Dosing

### `GET /api/dosing/logs`

List dosing logs, newest first, with an optional related diagnostic summary.

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `deviceId` | string | None | Filter by device. |
| `source` | enum | None | Filter by source: `AUTONOMOUS_EC`, `AUTONOMOUS_PH`, `ML_BIASED`, `MANUAL_OVERRIDE`. |
| `page` | integer | `1` | One-based page number. |
| `limit` | integer | `20` | Page size, capped at `50`. Use a positive integer. |

Success `200`:

```json
{
  "success": true,
  "pagination": { "total": 1, "page": 1, "pages": 1, "limit": 20 },
  "data": [
    {
      "id": "log-id",
      "deviceId": "esp32_node_01",
      "timestamp": "2026-09-27T12:00:00.000Z",
      "source": "MANUAL_OVERRIDE",
      "pumpType": "PH_DOWN",
      "durationMs": 800,
      "rationale": "Manual calibration pulse...",
      "mixingLockoutMin": 10,
      "diagnosticReportId": null,
      "diagnosticReport": null
    }
  ]
}
```

When present, `diagnosticReport` contains only `primaryLabel`, `confidence`, and `imageUrl`. Database/query errors return `500`. The implementation caps the upper limit at 50 but does not clamp invalid or negative page values; use positive values.

## Crop recipes

### `GET /api/crop/recipe`

Return the active recipe for a device, or the built-in baseline thresholds if the device has no active recipe.

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `deviceId` | string | `esp32_node_01` | Device identifier. |

Success `200` includes `success`, `deviceId`, `deviceName`, and `recipe`. Recipe fields are `id`, `cropName`, `targetPhMin`, `targetPhMax`, `targetEcMin`, `targetEcMax`, `ecCeiling`, `minWaterLevel`, `createdAt`, and `updatedAt` when a database recipe is active. With no assigned recipe, the baseline object has `cropName: "Default Baseline"`, `targetPhMin: 5.8`, `targetPhMax: 6.5`, `targetEcMin: 1.2`, `targetEcMax: 1.8`, `ecCeiling: 2.4`, and `minWaterLevel: 15.0`.

Errors: `404` if the device does not exist; `500` for a database failure.

### `PUT /api/crop/recipe`

Assign an existing recipe to a device, or update the active recipe's target thresholds.

JSON body fields:

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceId` | string | No | Target device; defaults to `esp32_node_01`. |
| `recipeId` | string | No | When supplied, assigns this recipe and ignores threshold fields. |
| `targetPhMin` | number | No | New lower pH target. |
| `targetPhMax` | number | No | New upper pH target. |
| `targetEcMin` | number | No | New lower EC target. |
| `targetEcMax` | number | No | New upper EC target. |

Examples:

```json
{ "deviceId": "esp32_node_01", "recipeId": "recipe-uuid" }
```

```json
{ "deviceId": "esp32_node_01", "targetPhMin": 5.9, "targetPhMax": 6.4 }
```

Recipe assignment succeeds with `200` and a message. Threshold updates succeed with `200` and the updated recipe in `data`. If no active recipe exists for a threshold update, the endpoint returns `400`. Other database errors return `500`. The route does not independently verify that a `recipeId` exists before assigning it; an invalid ID currently becomes a database error. Only truthy threshold values are applied, so zero is ignored. Use `/api/system/devices/:id/recipe` when you need explicit recipe unassignment.

## Vision

### `POST /api/vision/analyze`

Upload a canopy image, forward it to the configured ML service, persist its diagnosis, and start telemetry-based remediation asynchronously.

Content type: `multipart/form-data`.

| Form field | Type | Required | Description |
| --- | --- | --- | --- |
| `image` | file | Yes | Image file. Maximum size is 10 MiB. |
| `deviceId` | string | No | Device identifier; defaults to `esp32_node_01`. The route creates a basic device record if one does not exist. |
| `mockLabel` | string | No | Used only when the ML service call fails; testing override for the fallback diagnosis. |

The ML endpoint is configured by `ML_SERVICE_URL`, defaulting to `http://localhost:8000/api/vision/predict`. If the call fails or times out, the backend uses a fallback `HEALTHY` diagnosis unless `mockLabel` is supplied. The API response is sent before remediation completes.

Success `201` returns `{ "success": true, "message": "Canopy image diagnosed and logged", "data": <DiagnosticReport> }`. A report contains `id`, `deviceId`, `timestamp`, `imageUrl`, `primaryLabel`, `confidence`, `severity`, `classProbabilities`, `actionTaken`, and `cooldownActiveTill`. The returned `imageUrl` is a path under `/uploads/canopy/`.

Errors: `400` if no file reaches the route; `500` for persistence/processing errors. Multer rejects non-image MIME types and files larger than 10 MiB; those middleware errors may not use the API's JSON error envelope.

### `GET /api/vision/latest`

Return the latest diagnostic report for one device, including associated dosing events.

Query parameters: `deviceId` (string; default `esp32_node_01`).

Success `200`: `{ "success": true, "data": <DiagnosticReport with dosingEvents[]> }`. Errors: `404` if no report exists; `500` for a database failure.

### `GET /api/vision/history`

Return paginated diagnostic reports, newest first, including associated dosing events.

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `deviceId` | string | None | Optional device filter. |
| `page` | integer | `1` | One-based page number. |
| `limit` | integer | `10` | Page size, capped at `50`. Use a positive integer. |

Success `200`:

```json
{
  "success": true,
  "pagination": { "total": 1, "page": 1, "pages": 1, "limit": 10 },
  "data": [
    {
      "id": "report-id",
      "deviceId": "esp32_node_01",
      "timestamp": "2026-09-27T12:00:00.000Z",
      "imageUrl": "/uploads/canopy/canopy-1790510400000.jpg",
      "primaryLabel": "HEALTHY",
      "confidence": 0.94,
      "severity": "LOW",
      "classProbabilities": { "HEALTHY": 0.94 },
      "actionTaken": "Diagnosis pending telemetry evaluation",
      "cooldownActiveTill": null,
      "dosingEvents": []
    }
  ]
}
```

Database/query errors return `500`. As with dosing logs, use positive page and limit values; the route only caps the upper limit.

## System and devices

### `GET /api/system/status`

Return device online state, active recipe name, mixing and visual cooldowns, and unresolved alerts.

Query parameters: `deviceId` (string; default `esp32_node_01`).

Success `200`:

```json
{
  "success": true,
  "deviceId": "esp32_node_01",
  "deviceStatus": { "isOnline": true, "activeRecipe": "Butterhead Lettuce" },
  "mixingLockout": { "isActive": false, "remainingSeconds": 0, "lastPump": null },
  "visualCooldown": {
    "isActive": false,
    "remainingHours": 0,
    "activeTill": null,
    "primaryLabel": null
  },
  "activeAlerts": []
}
```

If no device record exists, `isOnline` is `false` and `activeRecipe` is `Default Baseline`. Database errors return `500`.

### `PUT /api/system/alerts/:id/resolve`

Acknowledge and resolve an alert.

Path parameter: `id` (alert identifier).

JSON body: `{ "resolvedBy": "operator-name" }`; `resolvedBy` is optional and defaults to `USER`.

Success `200`: `{ "success": true, "message": "Alert resolved successfully", "data": <updated SystemAlert> }`. Database errors, including an unknown alert ID, return `400`.

### `GET /api/system/devices`

List registered devices in creation order. Each `data` item includes `id`, `name`, `location`, `isOnline`, and `activeRecipe`. `activeRecipe` is `null` or contains `id`, `cropName`, `targetPhMin`, `targetPhMax`, `targetEcMin`, and `targetEcMax`.

Success `200`: `{ "success": true, "count": 1, "data": [<device>, ...] }`. Database errors return `500`.

### `POST /api/system/devices`

Register a device, optionally assigning a crop recipe. New devices start offline until a heartbeat is received.

JSON body:

| Name | Type | Required | Default / Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Unique identifier; whitespace is trimmed. |
| `name` | string | No | Defaults to `Node {id}`. |
| `location` | string | No | Defaults to `Unassigned Location`. |
| `recipeId` | string | No | Existing crop recipe ID to assign. |

Example:

```json
{
  "id": "esp32_node_02",
  "name": "Tower B - Nursery",
  "location": "Main Bay",
  "recipeId": "recipe-uuid"
}
```

Success `201`: `{ "success": true, "message": "...", "data": <Device with activeRecipe> }`. Errors: `400` if `id` is missing/blank; `409` if the ID already exists; `404` if `recipeId` does not exist; `500` for other database errors.

### `PUT /api/system/devices/:id/recipe`

Assign a recipe to an existing device, or remove its recipe association.

Path parameter: `id` (device identifier).

JSON body: `{ "recipeId": "recipe-uuid" }` to assign, or `{ "recipeId": null }` to unassign. An omitted `recipeId` also unassigns in the current implementation.

Success `200`: `{ "success": true, "message": "...", "data": <updated Device with activeRecipe> }`. Errors: `404` if the device or supplied recipe does not exist; `500` for other database failures.

## Uploaded files

The server exposes the local `backend/uploads` directory as static files under `/uploads`. Vision images can be fetched using the returned `imageUrl`, for example:

```text
GET http://localhost:3000/uploads/canopy/canopy-1790510400000.jpg
```

## Socket.IO events

Socket.IO is served by the same HTTP server. Clients can connect to the base URL using the Socket.IO client; no auth, rooms, or client-side subscription events are currently implemented. Events are broadcast to all connected clients.

| Event Name | Trigger Frequency | Payload Structure | Frontend Purpose |
| :--- | :--- | :--- | :--- |
| `telemetry:stream` | Every 5–10s when an MQTT packet arrives | `{ deviceId, sensors: { ph, ec_ms_cm, water_temp_c, air_temp_c, humidity_pct, water_level_pct }, timestamp }` | Live updates for circular gauges, dials, environmental graphs, and reservoir level indicators. |
| `dosing:event` | Fired on pump cycle dispatch (autonomous, ML-biased, or manual) | `{ deviceId, pumpType, durationMs, source, rationale, timestamp }` | Trigger toast notifications and flash real-time pump glow indicators. |
| `dosing:logged` | Fired when a dosing record is persisted to PostgreSQL | `{ deviceId, log: { id, deviceId, pumpType, durationMs, source, rationale, mixingLockoutMin, diagnosticReportId, timestamp } }` | Prepend new row directly into historical dosing audit table without page refresh. |
| `circulation:update` | Fired on circulation schedule/mode change | `{ deviceId, mode, runMin, restMin, timestamp }` | Synchronize circulation toggle controls, active mode badges, and duty-cycle interval displays. |
| `system:lockout` | Fired when a 10m mixing lockout starts or is evaluated | `{ deviceId, isActive, remainingSeconds, rationale, lastPump }` | Render countdown progress timer and disable manual dosing overrides. |
| `vision:cooldown` | Fired when ML-biased dosing completes | `{ deviceId, isActive, reportId, primaryLabel, activeTill }` | Display diagnostic lock banner preventing duplicate foliar intervention. |
| `system:alert` | Fired on safety gate trips or desync flags | `{ id, deviceId, alertType, severity, message, timestamp }` | Display high-priority warning banners and sound critical alarm indicators. |
| `alert:resolved` | Fired when sensor parameters normalize | `{ deviceId, alertType, resolvedBy, timestamp }` | Automatically dismiss active warning banners and restore nominal UI badges. |
| `device:heartbeat` | Fired on node online/offline transition | `{ deviceId, isOnline, lastSeen, timestamp }` | Update node connectivity pill indicator (green online / red offline). |

## MQTT device interface

The backend subscribes to telemetry topic `hydro/+/telemetry`. Device messages must be JSON and should use this shape:

```json
{
  "device_id": "esp32_node_01",
  "sensors": {
    "ph": 6.1,
    "ec_ms_cm": 1.5,
    "water_temp_c": 22.8,
    "water_level_pct": 82
  },
  "circulation_pump_state": "ON"
}
```

The handler also recognizes flat sensor fields, and aliases `ec`, `temp`, and `level` for `ec_ms_cm`, `water_temp_c`, and `water_level_pct`. Missing values are replaced with defaults by the current implementation. Telemetry is stored in InfluxDB, emitted as `telemetry:update`, and passed to dosing evaluation.

Actuator pump commands are published to `hydro/{deviceId}/commands` with QoS 1:

```json
{
  "command": "RUN_PUMP",
  "pump_type": "NUTRIENT_A",
  "duration_ms": 2500,
  "timestamp": 1790510400000
}
```

Circulation updates are published to `hydro/{deviceId}/circulation/set` with QoS 1:

```json
{
  "mode": "INTERVAL",
  "run_min": 15,
  "rest_min": 10,
  "timestamp": 1790510400000
}
```

The broker URL is configured with `MQTT_BROKER_URL`.

## Implementation notes

- PostgreSQL-backed resources use Prisma; telemetry reads and writes use InfluxDB. Availability of these services is required for their respective routes.
- Vision remediation runs asynchronously after the report is saved; the initial HTTP response does not include the final dosing outcome.
- `GET /api/telemetry/history` validates `range`, but `interval` is not validated before it is interpolated into the Flux query. Keep it to trusted, valid Flux durations.
- The backend currently has no centralized Express error handler, rate limiting, or request authentication. Configure access controls before exposing it outside a trusted network.

27/09/2026, 23:30 

Markdown Live Preview 

# Hydroponics System — API Documentation 

This documentation covers all RESTful API endpoints and WebSocket contracts implemented for the multi-device Smart Closed-Loop Hydroponics backend. 

Unless otherwise noted, successful JSON responses include `success: true` . Most failures use `{ "success": false, "error": "..." }` ; some not-found responses use `message` instead. Error response shapes are therefore not fully uniform. Dates returned from PostgreSQL and InfluxDB are ISO-8601 timestamps. Device IDs default to `esp32_node_01` on routes that document that default. 

- Base URL: `http://localhost:3000` (or `http://127.0.0.1:3000` ) 

- Default Device ID: `esp32_node_01` 

- Standard Content Type: `application/json` (except `/api/vision/analyze` , which uses `multipart/form-data` ) 

## 1. Telemetry API 

### 1.1 Get Latest Telemetry Snapshot 

Fetches the most recent cached electrochemical sensor metrics and circulation state for dashboard gauges. 

- Method: `GET` 

- Route: `/api/telemetry/latest` 

#### Query Parameters: 

`deviceId` (optional, string): Target hardware node ID. Defaults to `esp32_node_01` . 

#### Response 200 OK: 

```
{
  "success": true,
  "data": {
    "deviceId": "esp32_node_01",
    "timestamp": 1724486400000,
    "sensors": {
      "ph": 6.32,
      "ec_ms_cm": 1.45,
      "water_temp_c": 22.4,
      "water_level_pct": 78.5
    },
    "circulation_pump_state": "ON"
  }
}
```

Response 404 Not Found: Returned when no telemetry records exist in InfluxDB for the target device. 

### 1.2 Get Historical Telemetry Time Series 

Queries InfluxDB v2 using Flux `aggregateWindow()` to downsample metric buckets for Recharts time-series graphs. 

- Method: `GET` 

- Route: `/api/telemetry/history` 

#### Query Parameters: 



https://markdownlivepreview.com 

1/10 

27/09/2026, 23:30 

Markdown Live Preview 

`deviceId` (optional, string): Target node. Defaults to `esp32_node_01` . `range` (optional, string): Time window ( `1h` , `24h` , `7d` , `30d` ). Defaults to `24h` . `interval` (optional, string): Aggregation step ( `1m` , `5m` , `1h` ). Defaults to `5m` . 

#### Response 200 OK: 

```
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-09-26T18:00:00.000Z",
      "ph": 6.25,
      "ec_ms_cm": 1.42,
      "water_temp_c": 22.1,
      "water_level_pct": 80.2
    },
    {
      "timestamp": "2026-09-26T18:05:00.000Z",
      "ph": 6.27,
      "ec_ms_cm": 1.41,
      "water_temp_c": 22.3,
      "water_level_pct": 80.0
    }
  ]
}
```

## 2. Actuators & Overrides API 

### 2.1 Trigger Manual Peristaltic Pump Pulse 

Dispatches a manual calibration or emergency pulse from the dashboard. Enforces safety bounds (5000ms) and rejects requests if an active 10-minute mixing lockout is running. 

Method: `POST` 

Route: `/api/actuators/manual-pulse` 

#### Request Body: 

```
{
  "deviceId": "esp32_node_01",
  "pumpType": "PH_DOWN",
  "durationMs": 2000
}
```

```
  "deviceId": "esp32_node_01",
```

```
  "pumpType": "PH_DOWN",
```

#### Field Constraints: 

`pumpType` : Must be one of `PH_DOWN` , `NUTRIENT_A` , or `NUTRIENT_B` . 

`durationMs` : Integer between `100` and `5000` . 

#### Response 200 OK: 



https://markdownlivepreview.com 

2/10 

27/09/2026, 23:30 

Markdown Live Preview 

```
{
```

```
  "success": true,
  "message": "Dispatched manual PH_DOWN for 2000ms",
  "data": {
    "id": "7b8e19c0-12ab-4de3-93f8-cf981320ef45",
    "deviceId": "esp32_node_01",
    "timestamp": "2026-09-26T19:30:00.000Z",
    "source": "MANUAL_OVERRIDE",
    "pumpType": "PH_DOWN",
    "durationMs": 2000,
    "rationale": "Manual calibration pulse of PH_DOWN (2000ms) triggered via dashboard.",
    "mixingLockoutMin": 10
  }
}
```

Response 429 Too Many Requests: Returned when the 10-minute mixing quiet period is active. 

```
{
```

```
  "success": false,
  "error": "Actuator locked. 10-minute mixing lockout active (482s remaining)."
}
```

### 2.2 Configure Submersible Circulation Pump 

Controls Relay Channel 4 to drive 24/7 continuous aeration or duty-cycled intervals. 

Method: `POST` 

Route: `/api/actuators/circulation` 

Request Body: 

```
{
```

```
  "deviceId": "esp32_node_01",
  "mode": "CONTINUOUS",
  "runMin": 15,
  "restMin": 15
}
```

#### Field Constraints: 

`mode` : Must be `CONTINUOUS` , `INTERVAL` , or `OFF` . 

`runMin` / `restMin` : Positive integers in minutes (used when mode is `INTERVAL` ). 

Response 200 OK: 

```
{
  "success": true,
  "message": "Circulation schedule updated to CONTINUOUS",
  "data": {
    "mode": "CONTINUOUS",
    "run_min": 15,
    "rest_min": 15,
    "timestamp": 1724486400000
  }
}
```



https://markdownlivepreview.com 

3/10 

27/09/2026, 23:30 

Markdown Live Preview 

## 3. Dosing Logs API 

### 3.1 Get Paginated Dosing History 

Retrieves historical dosing events from PostgreSQL via Prisma for the system audit table. 

Method: `GET` 

Route: `/api/dosing/logs` 

#### Query Parameters: 

`deviceId` (optional, string): Filter by hardware node. 

`source` (optional, enum): Filter by `AUTONOMOUS_EC` , `AUTONOMOUS_PH` , `ML_BIASED` , or `MANUAL_OVERRIDE` . `page` (optional, int): Page index (default: `1` ). 

- `limit` (optional, int): Page size (default: `20` , max: `50` ). 

#### Response 200 OK: 

```
{
  "success": true,
  "pagination": {
    "total": 142,
    "page": 1,
    "pages": 8,
    "limit": 20
  },
  "data": [
    {
      "id": "83728abf-daa8-4bd7-9b1c-b6d921c034ae",
      "deviceId": "esp32_node_01",
      "timestamp": "2026-09-26T19:25:03.000Z",
      "source": "AUTONOMOUS_PH",
      "pumpType": "PH_DOWN",
      "durationMs": 2500,
      "rationale": "Standard closed-loop acid pulse. Hold nutrient salts.",
      "mixingLockoutMin": 10,
      "diagnosticReportId": null,
      "diagnosticReport": null
    }
  ]
}
```

## 4. Crop Recipe API 

### 4.1 Get Active Crop Recipe 

Returns the active electrochemical recipe target bands currently assigned to a device. 

Method: `GET` 

Route: `/api/crop/recipe` 

#### Query Parameters: 

`deviceId` (optional, string): Node ID. Defaults to `esp32_node_01` . 

Response 200 OK: 



https://markdownlivepreview.com 

4/10 

27/09/2026, 23:30 

Markdown Live Preview 

```
{
  "success": true,
  "deviceId": "esp32_node_01",
  "deviceName": "Hydroponics Bench 01",
  "recipe": {
    "id": "e3b0c442-98fc-1c14-9afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "cropName": "Butterhead Lettuce",
    "targetPhMin": 5.8,
    "targetPhMax": 6.5,
    "targetEcMin": 1.2,
    "targetEcMax": 1.8,
    "ecCeiling": 2.4,
    "minWaterLevel": 15.0,
    "createdAt": "2026-09-26T12:00:00.000Z",
    "updatedAt": "2026-09-26T12:00:00.000Z"
  }
}
```

### 4.2 Update or Reassign Crop Recipe 

Updates electrochemical thresholds for the assigned recipe or switches the device to a new recipe preset. 

Method: `PUT` 

Route: `/api/crop/recipe` 

Request Body: 

```
{
  "deviceId": "esp32_node_01",
  "recipeId": "optional-uuid-to-switch-preset",
  "targetPhMin": 5.8,
  "targetPhMax": 6.5,
  "targetEcMin": 1.4,
  "targetEcMax": 2.0
}
```

#### Response 200 OK: 

```
{
  "success": true,
  "data": {
    "id": "e3b0c442-98fc-1c14-9afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "cropName": "Butterhead Lettuce",
    "targetPhMin": 5.8,
    "targetPhMax": 6.5,
    "targetEcMin": 1.4,
    "targetEcMax": 2.0,
    "ecCeiling": 2.4,
    "minWaterLevel": 15.0
  }
}
```

## 5. System Status & Alerts API 

### 5.1 Get System Operational Status & Lockouts 



Provides the Next.js frontend with live lockout countdown bars, device health, and unresolved critical warnings. 

5/10 

https://markdownlivepreview.com 

27/09/2026, 23:30 

Markdown Live Preview 



Method: `GET` Route: `/api/system/status` 

Query Parameters: 

`deviceId` (optional, string): Defaults to `esp32_node_01` . 

Response 200 OK: 

```
{
  "success": true,
  "deviceId": "esp32_node_01",
  "deviceStatus": {
    "isOnline": true,
    "activeRecipe": "Butterhead Lettuce"
  },
  "mixingLockout": {
    "isActive": true,
    "remainingSeconds": 582,
    "lastPump": "PH_DOWN"
  },
  "visualCooldown": {
    "isActive": true,
    "remainingHours": 47.8,
    "activeTill": "2026-09-28T19:35:00.000Z",
    "primaryLabel": "NITROGEN_DEFICIENCY"
  },
  "activeAlerts": [
    {
      "id": "c1f72839-44be-4172-87ad-d34934e89791",
      "deviceId": "esp32_node_01",
      "timestamp": "2026-09-26T19:20:00.000Z",
      "alertType": "ACIDIC_CRASH",
      "severity": "CRITICAL",
      "message": "Acidic crash detected (pH 5.2 < 5.5). No pH Up pump available. Manual buffering required.",
      "isResolved": false
    }
  ]
}
```



### 6.2 Acknowledge / Resolve System Alert 

Allows a user to dismiss an active warning banner from the dashboard. 

Method: `PUT` 

Route: `/api/system/alerts/:id/resolve` 

Path Parameters: 

`id` (string, required): UUID of the SystemAlert. 

Request Body: 

```
{
  "resolvedBy": "USER"
}
```

Response 200 OK: 

https://markdownlivepreview.com 

6/10 

27/09/2026, 23:30 

Markdown Live Preview 

```
{
```

```
  "success": true,
  "message": "Alert resolved successfully",
  "data": {
    "id": "c1f72839-44be-4172-87ad-d34934e89791",
    "isResolved": true,
    "resolvedAt": "2026-09-26T19:40:00.000Z",
    "resolvedBy": "USER"
  }
}
```

### 6.3 Get All the Devices 

Fetches the list of all the devices in the system database. 

Method: `GET` 

Route: `/api/system/devices` 

Response 200 OK: 

```
{
    "success": true,
    "count": 2,
    "data": [
        {
            "id": "esp32_node_01",
            "name": "Hydroponics Bench 01",
            "location": "Reservoir A",
            "isOnline": false,
            "activeRecipe": {
                "id": "f358c059-3099-4ace-8159-599625c5fe55",
                "cropName": "Butterhead Lettuce",
                "targetPhMin": 5.8,
                "targetPhMax": 6.5,
                "targetEcMin": 1.2,
                "targetEcMax": 1.8
            }
        },
        {
            "id": "esp32_node_2",
            "name": "Hydroponics Bench 02",
            "location": "Reservoir A",
            "isOnline": false,
            "activeRecipe": null
        }
    ]
}
```

### 6.4 Add a device 

Register a device, optionally assigning a crop recipe. New devices start offline until a heartbeat is received. 

Method: `POST` 

Route: `/api/system/devices` 

#### Request Body 



https://markdownlivepreview.com 

7/10 

27/09/2026, 23:30 

Markdown Live Preview 

```
{
    "id": "esp32_node_2",
    "name": "Hydroponics Bench 02",
    "location": "Reservoir A",
    "recipeId": "f358c059-3099-4ace-8159-599625c5fe55"
}
```

Response 201 Created 

```
{
    "success": true,
    "message": "Device 'esp32_node_02' registered successfully.",
    "data": {
        "id": "esp32_node_02",
        "name": "Hydroponics Bench 02",
        "location": "Reservoir A",
        "isOnline": false,
        "createdAt": "2026-09-27T11:43:08.912Z",
        "activeRecipeId": "f358c059-3099-4ace-8159-599625c5fe55",
        "activeRecipe": {
            "id": "f358c059-3099-4ace-8159-599625c5fe55",
            "cropName": "Butterhead Lettuce",
            "targetPhMin": 5.8,
            "targetPhMax": 6.5,
            "targetEcMin": 1.2,
            "targetEcMax": 1.8,
            "ecCeiling": 2.4,
            "minWaterLevel": 15,
            "createdAt": "2026-09-26T17:50:21.211Z",
            "updatedAt": "2026-09-26T17:50:21.211Z"
        }
    }
}
```

### 6.5 Modify a crop on a Device 

Assign a recipe to an existing device, or remove its recipe association. 

Method: `PUT` 

Route: `/api/system/devices` 

Path Parameter: 

`id` (required, string): Select a hardware node. 

Request Body 

```
{
    "recipeId": "f358c059-3099-4ace-8159-599625c5fe55"
}
```

Field Constraint 

`recipeId` : Required; `recipe-uuid` to assign. or `null` to unassign. 

Response 200 OK 



https://markdownlivepreview.com 

8/10 

27/09/2026, 23:30 

Markdown Live Preview 

```
{
```

```
    "success": true,
    "message": "Device 'esp32_node_2' recipe unassigned.",
    "data": {
        "id": "esp32_node_2",
        "name": "Hydroponics Bench 02",
        "location": "Reservoir A",
        "isOnline": false,
        "createdAt": "2026-09-26T20:26:46.216Z",
        "activeRecipeId": null,
        "activeRecipe": null
    }
}
```

## 7. Uploaded files 

The server exposes the local `backend/uploads` directory as static files under `/uploads` . Vision images can be fetched using the returned `imageUrl` , for example: 

```
GET http://localhost:3000/uploads/canopy/canopy-1790510400000.jpg
```

## 8. Real-Time WebSockets (Socket.io) 

- Connection URL: `ws://localhost:3000` (or `http://localhost:3000` ) 

- Transports: `["websocket", "polling"]` 



https://markdownlivepreview.com 

9/10 

27/09/2026, 23:30 

Markdown Live Preview 

### Outbound Events (Server -> Client) 

|EventName|TriggerFrequency|PayloadStructure|FrontendPurpose|
|---|---|---|---|
|`telemetry:stream`|Every 5–10s when an<br>MQTT packet arrives|`{ deviceId, sensors: { ph,`<br>`ec_ms_cm, water_temp_c,`<br>`air_temp_c, humidity_pct,`<br>`water_level_pct }, timestamp }`|Live updates for<br>circular gauges, dials,<br>environmental graphs,<br>and reservoir level<br>indicators.|
|`dosing:event`|Fired on pump cycle<br>dispatch<br>(autonomous,ML-<br>biased, or manual)|`{ deviceId, pumpType,`<br>`durationMs, source, rationale,`<br>`timestamp }`|Trigger toast<br>notifications and flash<br>real-time pump glow<br>indicators.|
|`dosing:logged`|Fired when a dosing<br>record is persisted to<br>PostgreSQL|`{ deviceId, log: { id,`<br>`deviceId, pumpType, durationMs,`<br>`source, rationale,`<br>`mixingLockoutMin,`<br>`diagnosticReportId, timestamp }`<br>`}`|Prepend new row<br>directly into historical<br>dosing audit table<br>without page refresh.|
|`circulation:update`|Fired on circulation<br>schedule/mode<br>change|`{ deviceId, mode, runMin,`<br>`restMin, timestamp }`|Synchronize circulation<br>toggle controls, active<br>mode badges, and<br>duty-cycle interval<br>displays.|
|`system:lockout`|Fired when a 10m<br>mixing lockout starts<br>or is evaluated|`{ deviceId, isActive,`<br>`remainingSeconds, rationale,`<br>`lastPump }`|Render countdown<br>progress timer and<br>disable manual dosing<br>overrides.|
|`vision:cooldown`|Fired whenML-<br>biased dosing<br>completes|`{ deviceId, isActive, reportId,`<br>`primaryLabel, activeTill }`|Display diagnostic lock<br>banner preventing<br>duplicate foliar<br>intervention.|
|`system:alert`|Fired on safety gate<br>trips or desync flags|`{ id, deviceId, alertType,`<br>`severity, message, timestamp }`|Display high-priority<br>warning banners and<br>sound critical alarm<br>indicators.|
|`alert:resolved`|Fired when sensor<br>parameters<br>normalize|`{ deviceId, alertType,`<br>`resolvedBy, timestamp }`|Automatically dismiss<br>active warning banners<br>and restore nominal UI<br>badges.|
|`device:heartbeat`|Fired on node<br>online/offline<br>transition|`{ deviceId, isOnline, lastSeen,`<br>`timestamp }`|Update node<br>connectivity pill<br>indicator (green online /<br>red offline).|





https://markdownlivepreview.com 

10/10 


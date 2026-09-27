import { InfluxDB } from "@influxdata/influxdb-client";

const influx = new InfluxDB({
    url: process.env.INFLUX_URL,
    token: process.env.INFLUX_TOKEN
});

const writeApi = influx.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET);
const queryApi = influx.getQueryApi(process.env.INFLUX_ORG);

writeApi.listener = {
  writeFailed(error) {
    console.error('InfluxDB write error:', error.message);
  },
};

export {writeApi, queryApi}
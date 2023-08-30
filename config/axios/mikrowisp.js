const axios = require('axios');

const instanceMikrowisp = axios.create({
    baseURL: 'http://internaldb.airwiz.com.pe/mikrowisp',
    headers: {'Authorization ': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTQUxWQURPUiBMT1BFWiBUQUZVUiIsImVtYWlsIjoic2FsdmFkb3IubG9wZXpAYWlyd2l6LmNvbS5wZSIsInVpZCI6IjEiLCJleHAiOjE2OTI5MTcxNjYsImlzcyI6ImptZGV2IiwiYXVkIjoiam1hdWRpZW5jZSJ9.ErYsoF0lLMhdLWD9TDNbRXExigHmOTqQl8Cn_dRMWko'}
  });

module.exports = instanceMikrowisp;
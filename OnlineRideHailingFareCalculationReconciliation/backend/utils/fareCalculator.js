const moment = require('moment');

function calculateFare(distanceKm, waitMinutes, startTime, pricingRule) {
  const rule = pricingRule || {
    base_fare: 14.00,
    base_km: 3.00,
    per_km_fare: 2.50,
    free_wait_minutes: 5,
    per_minute_wait_fare: 0.50,
    night_surcharge_rate: 0.30,
    night_start_hour: 23,
    night_end_hour: 5
  };

  let fare = 0;
  const startMoment = moment(startTime);
  const hour = startMoment.hour();
  const isNightTime = hour >= rule.night_start_hour || hour < rule.night_end_hour;

  fare += rule.base_fare;

  if (distanceKm > rule.base_km) {
    const extraKm = distanceKm - rule.base_km;
    fare += extraKm * rule.per_km_fare;
  }

  if (waitMinutes > rule.free_wait_minutes) {
    const extraWaitMinutes = waitMinutes - rule.free_wait_minutes;
    fare += extraWaitMinutes * rule.per_minute_wait_fare;
  }

  if (isNightTime) {
    fare = fare * (1 + rule.night_surcharge_rate);
  }

  return Math.round(fare * 100) / 100;
}

function isNightTime(time, rule) {
  const hour = moment(time).hour();
  return hour >= rule.night_start_hour || hour < rule.night_end_hour;
}

module.exports = {
  calculateFare,
  isNightTime
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTripMetrics(gpsDataList) {
  if (!gpsDataList || gpsDataList.length < 2) {
    return {
      totalDistance: 0,
      totalDuration: 0,
      waitDuration: 0,
      startPoint: null,
      endPoint: null,
      startTime: null,
      endTime: null
    };
  }

  let totalDistance = 0;
  let waitDuration = 0;
  const WAIT_SPEED_THRESHOLD = 5;

  const sortedData = [...gpsDataList].sort((a, b) =>
    new Date(a.gps_time) - new Date(b.gps_time)
  );

  for (let i = 1; i < sortedData.length; i++) {
    const prev = sortedData[i - 1];
    const curr = sortedData[i];

    const distance = calculateDistance(
      prev.latitude, prev.longitude,
      curr.latitude, curr.longitude
    );
    totalDistance += distance;

    const timeDiff = (new Date(curr.gps_time) - new Date(prev.gps_time)) / 1000;
    if (curr.speed < WAIT_SPEED_THRESHOLD && prev.speed < WAIT_SPEED_THRESHOLD) {
      waitDuration += timeDiff;
    }
  }

  const startTime = new Date(sortedData[0].gps_time);
  const endTime = new Date(sortedData[sortedData.length - 1].gps_time);
  const totalDuration = (endTime - startTime) / 1000;

  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalDuration: Math.round(totalDuration),
    waitDuration: Math.round(waitDuration),
    startPoint: {
      latitude: sortedData[0].latitude,
      longitude: sortedData[0].longitude
    },
    endPoint: {
      latitude: sortedData[sortedData.length - 1].latitude,
      longitude: sortedData[sortedData.length - 1].longitude
    },
    startTime,
    endTime
  };
}

module.exports = {
  calculateDistance,
  calculateTripMetrics
};

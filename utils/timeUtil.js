
const minutesPassedSince = (startTime) => {
  const timeNow = Date.now()
  const diffMS = timeNow - startTime
  const diffMins = Math.round(((diffMS % 86400000) % 3600000) / 60000)
  return diffMins
}

module.exports = { minutesPassedSince }
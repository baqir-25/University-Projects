const COURT_STATUSES = ["available", "unavailable", "maintenance"];

function effectiveCourtStatus(court) {
  if (!court) return "unavailable";
  if (court.status && COURT_STATUSES.includes(court.status)) {
    return court.status;
  }
  return court.isActive === false ? "unavailable" : "available";
}

function courtAllowsBookings(court) {
  return effectiveCourtStatus(court) === "available";
}

module.exports = {
  COURT_STATUSES,
  effectiveCourtStatus,
  courtAllowsBookings,
};

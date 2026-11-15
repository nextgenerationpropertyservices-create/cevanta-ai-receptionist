export function missedCallCheckup(missed: number, returned: number, booked: number) {
  if (![missed, returned, booked].every(value => Number.isSafeInteger(value) && value >= 0)) {
    return { error: "Enter a whole number of zero or more for each count." } as const;
  }
  if (returned > missed) return { error: "Callbacks can’t exceed the number of missed calls." } as const;
  if (booked > returned) return { error: "Jobs booked from callbacks can’t exceed the number of callbacks." } as const;

  return {
    outstanding: missed - returned,
    callbackRate: missed ? Math.round(returned / missed * 100) : null,
    bookingRate: returned ? Math.round(booked / returned * 100) : null,
  };
}

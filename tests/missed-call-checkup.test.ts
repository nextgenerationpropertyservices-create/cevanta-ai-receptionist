import { describe, expect, it } from "vitest";
import { missedCallCheckup } from "@/lib/missed-call-checkup";

describe("Missed Call Checkup", () => {
  it("uses missed calls for callback rate and returned calls for booking rate", () => {
    expect(missedCallCheckup(12, 7, 2)).toEqual({ outstanding: 5, callbackRate: 58, bookingRate: 29 });
  });

  it("distinguishes a zero rate from a missing denominator", () => {
    expect(missedCallCheckup(0, 0, 0)).toEqual({ outstanding: 0, callbackRate: null, bookingRate: null });
    expect(missedCallCheckup(4, 0, 0)).toEqual({ outstanding: 4, callbackRate: 0, bookingRate: null });
  });

  it.each([[2, 3, 0], [4, 2, 3], [NaN, 0, 0], [-1, 0, 0], [1.2, 0, 0]])(
    "rejects inconsistent or invalid counts (%s, %s, %s)",
    (missed, returned, booked) => expect(missedCallCheckup(missed, returned, booked)).toHaveProperty("error"),
  );
});

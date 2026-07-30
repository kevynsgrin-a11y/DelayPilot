import type { Provenance } from "@/components/provenance";
import type { RightsStatus, RiskLevel, StatusTone } from "@/components/status";

/* ------------------------------------------------------------------ */
/* DEMO DATA — deliberately synthetic. Airline names and flight        */
/* numbers below do not correspond to real operating carriers. Every   */
/* panel that renders this data shows "Demo data — not a live flight." */
/* ------------------------------------------------------------------ */

export type SegmentDatum = {
  id: string;
  airline: string; // text name only, no logo
  code: string; // synthetic carrier code
  flightNumber: string;
  origin: { code: string; city: string; tz: string };
  destination: { code: string; city: string; tz: string };
  scheduledDep: string;
  currentDep: string;
  scheduledArr: string;
  currentArr: string;
  depTzLabel: string;
  arrTzLabel: string;
  status: { tone: StatusTone; label: string };
  gate: string | null; // null => Unknown state
  terminal: string | null;
  delayMinutes: number | null;
  provenance: Provenance;
  freshness: string;
  source: string;
  confidence: "High" | "Medium" | "Low" | "Unknown";
  causeStated: string | null;
};

export const demoSegments: SegmentDatum[] = [
  {
    id: "seg-1",
    airline: "Meridian Air",
    code: "Mr", // stylized; not a real IATA code
    flightNumber: "MR 1487",
    origin: { code: "PDX", city: "Portland", tz: "PT" },
    destination: { code: "DEN", city: "Denver", tz: "MT" },
    scheduledDep: "14:05",
    currentDep: "14:52",
    scheduledArr: "17:38",
    currentArr: "18:25",
    depTzLabel: "PDX · PT",
    arrTzLabel: "DEN · MT",
    status: { tone: "watch", label: "Delayed" },
    gate: "C7",
    terminal: "C",
    delayMinutes: 47,
    provenance: "Live",
    freshness: "Updated 4 min ago",
    source: "Provider A (demo feed)",
    confidence: "High",
    causeStated: "Airline-stated: late inbound aircraft",
  },
  {
    id: "seg-2",
    airline: "Cascade Connect",
    code: "Cc",
    flightNumber: "CC 902",
    origin: { code: "DEN", city: "Denver", tz: "MT" },
    destination: { code: "JFK", city: "New York", tz: "ET" },
    scheduledDep: "18:40",
    currentDep: "18:40",
    scheduledArr: "00:22",
    currentArr: "00:22",
    depTzLabel: "DEN · MT",
    arrTzLabel: "JFK · ET",
    status: { tone: "safe", label: "On time" },
    gate: null, // Unknown — not yet assigned in feed
    terminal: "A",
    delayMinutes: 0,
    provenance: "Cached",
    freshness: "Updated 21 min ago",
    source: "Provider A (demo feed)",
    confidence: "Medium",
    causeStated: null,
  },
];

export type ConnectionComponent = {
  label: string;
  minutes: number | null;
  note?: string;
};

export const demoConnection = {
  protection: "protected" as "protected" | "self-transfer",
  airport: "DEN · Denver",
  inboundGateIn: "18:31 MT",
  nextGateClose: "18:25 MT",
  availableMinutes: 41,
  requiredMinutes: 23,
  slackMinutes: 18,
  riskBand: "moderate" as RiskLevel,
  components: [
    { label: "Deplane inbound", minutes: 8 },
    { label: "Walk between gates", minutes: 9, note: "C7 → A14, one train" },
    { label: "Security re-clear", minutes: 0, note: "Not required — airside" },
    { label: "Immigration", minutes: 0, note: "Domestic — not applicable" },
    { label: "Checked-bag transfer", minutes: null, note: "Handled by carrier on through-ticket" },
    { label: "Mobility buffer", minutes: 0, note: "None requested" },
    { label: "Uncertainty buffer", minutes: 6, note: "Feed variance on inbound" },
  ] as ConnectionComponent[],
  assumptions: [
    "Through-ticketed itinerary; bags checked to final destination.",
    "Both segments depart from the same terminal complex (airside transfer).",
    "No passport control between segments (domestic connection).",
  ],
  missing: [
    "Arrival gate for the onward flight is not yet published.",
    "Real-time inbound taxi time is unavailable in this feed.",
  ],
};

export type RightsFacet = {
  key: string;
  title: string;
  status: RightsStatus;
  summary: string;
  detail: string;
};

export const demoRights = {
  jurisdiction: "United States (DOT)",
  ruleVersion: "US-DOT rule set v2026.04",
  effectiveDate: "Effective 2026-04-01",
  facets: [
    {
      key: "refund",
      title: "Refund",
      status: "may_apply" as RightsStatus,
      summary:
        "A significant delay or cancellation may entitle you to a refund to your original form of payment if you choose not to travel.",
      detail:
        "Under the cited rule version, a cash refund may apply when a schedule change crosses the carrier's 'significant change' threshold and you decline the alternative offered. The exact threshold and whether it is met depends on the final delay, which is not yet confirmed.",
    },
    {
      key: "rebooking",
      title: "Rebooking",
      status: "likely_applies" as RightsStatus,
      summary:
        "The carrier will typically rebook you on its next available service at no additional fare.",
      detail:
        "Rebooking onto the operating carrier's own flights is standard for a carrier-caused disruption. Rebooking onto another carrier is discretionary and not guaranteed under this rule version.",
    },
    {
      key: "care",
      title: "Care (meals / hotel)",
      status: "cannot_determine" as RightsStatus,
      summary:
        "Whether meal or hotel care applies depends on the overnight status and stated cause, which are not confirmed.",
      detail:
        "Care obligations here follow the carrier's published customer-service commitments for controllable disruptions. We cannot determine applicability until the disruption is classified and an overnight is confirmed.",
    },
    {
      key: "compensation",
      title: "Cash compensation",
      status: "not_indicated" as RightsStatus,
      summary:
        "This jurisdiction's rule version does not indicate fixed cash compensation for delay in this scenario.",
      detail:
        "Unlike some jurisdictions, the cited US rule version does not specify a fixed statutory delay-compensation amount. This is not legal advice; consult the official source for your exact case.",
    },
  ] as RightsFacet[],
  deadline: "No filing deadline is indicated for a refund request under the cited version; carriers must process eligible refunds promptly.",
  needToKnow: [
    "The final arrival delay once the flight operates or is cancelled.",
    "The carrier's officially stated cause of the disruption.",
    "Whether the disruption forces an overnight at the connection point.",
  ],
  evidence: [
    "Screenshot of the schedule change notice with its timestamp.",
    "Boarding passes or itinerary confirmation for each segment.",
    "Receipts for any meals or lodging paid out of pocket.",
    "Any written communication stating the cause of the disruption.",
  ],
  sources: [
    { label: "Official DOT aviation consumer protection page", note: "primary source" },
    { label: "Carrier customer-service commitment (published)", note: "carrier plan" },
  ],
};

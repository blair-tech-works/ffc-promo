// Move-out condition report template.
//
// Every line below traces to a clause of the lease between The Last Resort LLC
// and the Idaho Transportation Department, executed November 2025. Keeping the
// clause references in the data (not just the UI) means a completed report can
// be read back years later and tied to the obligation it was recording.

export type Mark = "" | "OK" | "WT" | "D" | "NA";

export type Line = {
  id: string;
  label: string;
  /** Replacement cost printed on the lease, for key/device lines. */
  unitCost?: number;
  /** Key lines track issued/returned counts instead of a condition mark. */
  countable?: boolean;
};

export type Section = {
  id: string;
  title: string;
  /** Clause this section enforces, shown to whoever is filling it in. */
  clause?: string;
  note?: string;
  /** Rooms are cloned from a template as the inspector adds them. */
  repeatable?: boolean;
  lines: Line[];
};

export const MARKS: { value: Mark; label: string; hint: string }[] = [
  { value: "OK", label: "OK", hint: "Acceptable — no charge" },
  { value: "WT", label: "Wear", hint: "Ordinary wear and tear — NOT chargeable under Section 7" },
  { value: "D", label: "Damage", hint: "Beyond ordinary wear — may support a deduction" },
  { value: "NA", label: "N/A", hint: "Not applicable or not present" },
];

/** Section 7(d) caps the base cleaning fee. Hard-coded so nobody types a larger number. */
export const CLEANING_FEE_CAP = 200;
export const DEPOSIT_HELD = 2000;

const roomLines: Line[] = [
  { id: "walls", label: "Walls and ceiling" },
  { id: "floor", label: "Flooring / carpet" },
  { id: "doors", label: "Doors and hardware" },
  { id: "windows", label: "Windows, screens, coverings" },
  { id: "fixtures", label: "Light fixtures and outlets" },
  { id: "closets", label: "Closets / built-ins" },
  { id: "furnishings", label: "Furnishings provided by Owner" },
  { id: "clean", label: "Cleanliness" },
];

export const ROOM_TEMPLATE: Section = {
  id: "room",
  title: "Room",
  repeatable: true,
  lines: roomLines,
};

export const SECTIONS: Section[] = [
  {
    id: "keys",
    title: "Keys, remotes and access devices",
    clause: "Lease Sections 12 and 38",
    note:
      "Unreturned items are charged at $50.00 per item or actual documented replacement cost, whichever is greater. A missing key that presents a security concern may justify re-keying the lockset.",
    lines: [
      { id: "frontdoor", label: "Front door key", unitCost: 25, countable: true },
      { id: "mailbox", label: "Mailbox key", unitCost: 15, countable: true },
      { id: "garage", label: "Garage remote / opener", unitCost: 75, countable: true },
      { id: "codes", label: "Door / keypad access codes", countable: true },
      { id: "otherkey", label: "Other access device", countable: true },
    ],
  },
  {
    id: "safety",
    title: "Life safety devices",
    clause: "Smoke & Carbon Monoxide Alarm Addendum",
    note:
      "The Addendum records that all alarms were present, correctly located and functionally tested at move-in. Tampering carries a civil penalty of up to $200.",
    lines: [
      { id: "smoke", label: "Smoke alarms — present and tested" },
      { id: "co", label: "Carbon monoxide alarms — present and tested" },
      { id: "tamper", label: "Evidence of tampering, removal or dead batteries" },
      { id: "extinguisher", label: "Fire extinguisher(s) present and charged" },
    ],
  },
  {
    id: "mechanical",
    title: "Mechanical systems",
    lines: [
      { id: "tankless", label: "Tankless water heater" },
      { id: "welltank", label: "Well tank and T assembly" },
      { id: "furnace", label: "Furnace / heating" },
      { id: "filter", label: "HVAC air filter (see HVAC Addendum)" },
      { id: "filtration", label: "Water softener / filtration" },
      { id: "plumbing", label: "Plumbing — leaks, drains" },
      { id: "electrical", label: "Electrical — outlets, switches" },
      { id: "septic", label: "Septic / sewer" },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen and appliances",
    clause: "Lease Section 38(a)",
    note: "Section 38(a) names cabinet interiors specifically — check inside, not just the faces.",
    lines: [
      { id: "fridge", label: "Refrigerator — interior and exterior" },
      { id: "range", label: "Range / oven / cooktop" },
      { id: "hood", label: "Range hood and filter" },
      { id: "microwave", label: "Microwave" },
      { id: "dishwasher", label: "Dishwasher" },
      { id: "sink", label: "Sink, faucet, disposal" },
      { id: "cabinets", label: "Cabinets — interior AND exterior" },
      { id: "counters", label: "Countertops and backsplash" },
      { id: "washer", label: "Washer" },
      { id: "dryer", label: "Dryer and vent" },
      { id: "smallgoods", label: "Cookware / dishes / small goods" },
    ],
  },
  {
    id: "bath",
    title: "Bathroom",
    repeatable: true,
    lines: [
      { id: "toilet", label: "Toilet" },
      { id: "sink", label: "Sink, faucet, pop-up assembly" },
      { id: "tub", label: "Tub / shower / surround" },
      { id: "mirror", label: "Mirror, cabinet, fixtures" },
      { id: "fan", label: "Exhaust fan" },
      { id: "floor", label: "Flooring and grout" },
      { id: "mold", label: "Evidence of mold or moisture" },
    ],
  },
  {
    id: "exterior",
    title: "Exterior, grounds and parking",
    clause: "Lease Section 38(b) and the Landscaping Addendum",
    note:
      "The Landscaping Addendum requires lawn, beds and hardscape be returned in the same or better condition as at move-in, LESS ORDINARY SEASONAL VARIATION. Dormancy in November is not a chargeable condition.",
    lines: [
      { id: "decks", label: "Decks, patios, railings" },
      { id: "carports", label: "Carports" },
      { id: "garage", label: "Garage / outbuildings" },
      { id: "storage", label: "Storage areas" },
      { id: "lawn", label: "Lawn, beds, hardscape" },
      { id: "siding", label: "Exterior walls, siding, paint" },
      { id: "gutters", label: "Gutters and downspouts" },
      { id: "snow", label: "Snow / ice damage" },
      { id: "debris", label: "Trash and debris removed" },
      { id: "stains", label: "Oil stains or ground damage" },
    ],
  },
];

/**
 * Default injection site catalogue. Regions map to areas on the
 * InjectionSiteMap illustration; users can enable/disable them.
 */
export interface DefaultSite {
  name: string;
  bodyRegion: string;
}

export const DEFAULT_INJECTION_SITES: DefaultSite[] = [
  { name: "Abdomen — upper left", bodyRegion: "abdomen_upper_left" },
  { name: "Abdomen — upper right", bodyRegion: "abdomen_upper_right" },
  { name: "Abdomen — lower left", bodyRegion: "abdomen_lower_left" },
  { name: "Abdomen — lower right", bodyRegion: "abdomen_lower_right" },
  { name: "Thigh — left", bodyRegion: "thigh_left" },
  { name: "Thigh — right", bodyRegion: "thigh_right" },
  { name: "Glute — left", bodyRegion: "glute_left" },
  { name: "Glute — right", bodyRegion: "glute_right" },
  { name: "Upper arm — left", bodyRegion: "arm_left" },
  { name: "Upper arm — right", bodyRegion: "arm_right" },
];

/** Days a site should rest before it is recommended again. */
export const ROTATION_REST_DAYS = 7;

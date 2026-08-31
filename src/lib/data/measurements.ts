import type { SupabaseClient } from "@supabase/supabase-js";
import type { BodyMeasurement } from "@/lib/types";
import type { MeasurementInput } from "@/lib/validation/measurement";

/** All measurements for the current user, newest first. */
export async function listMeasurements(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .order("measured_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BodyMeasurement[];
}

/** The single most recent measurement, or null. */
export async function getLatestMeasurement(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as BodyMeasurement | null) ?? null;
}

function toRow(userId: string, input: MeasurementInput, photos: string[]) {
  return {
    user_id: userId,
    measured_at: input.measuredAt,
    weight: input.weight ?? null,
    weight_unit: input.weightUnit,
    body_fat: input.bodyFat ?? null,
    muscle_mass: input.muscleMass ?? null,
    length_unit: input.lengthUnit,
    neck: input.neck ?? null,
    chest: input.chest ?? null,
    waist: input.waist ?? null,
    hips: input.hips ?? null,
    arms: input.arms ?? null,
    arm_left: input.armLeft ?? null,
    arm_right: input.armRight ?? null,
    thighs: input.thighs ?? null,
    thigh_left: input.thighLeft ?? null,
    thigh_right: input.thighRight ?? null,
    notes: input.notes || null,
    photos,
    camera: input.camera ?? null,
    lens: input.lens ?? null,
    focal_length: input.focalLength ?? null,
    subject_distance: input.subjectDistance ?? null,
    flash: input.flash ?? null,
    flash_power: input.flashPower ?? null,
    aperture: input.aperture ?? null,
    diaphragm: input.diaphragm ?? null,
    shutter_speed: input.shutterSpeed ?? null,
    iso: input.iso ?? null,
    white_balance: input.whiteBalance ?? null,
    camera_elevation: input.cameraElevation ?? null,
  };
}

export async function createMeasurement(
  supabase: SupabaseClient,
  userId: string,
  input: MeasurementInput,
  photos: string[]
) {
  const { data, error } = await supabase
    .from("body_measurements")
    .insert(toRow(userId, input, photos))
    .select()
    .single();
  if (error) throw error;
  return data as BodyMeasurement;
}

export async function updateMeasurement(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: MeasurementInput,
  photos: string[]
) {
  const { error } = await supabase
    .from("body_measurements")
    .update(toRow(userId, input, photos))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMeasurement(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from("body_measurements")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

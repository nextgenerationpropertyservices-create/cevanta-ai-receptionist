"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { OFFICE_ROLES } from "@/lib/contracts";
import { customerSchema, contactSchema, serviceLocationSchema, equipmentSchema } from "@/lib/validation";
import { requireMembership, uuidSchema } from "@/lib/server/authorization";
import type { ActionState } from "@/lib/server/action-state";

function id(form: FormData, field: string) {
  const value = uuidSchema.safeParse(form.get(field));
  if (!value.success) throw new Error("Invalid record.");
  return value.data;
}

async function mutate(form: FormData, kind: "customer" | "contact" | "location" | "equipment"): Promise<ActionState> {
  try {
    const tenantId = id(form, "tenantId");
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const schema = { customer: customerSchema, contact: contactSchema, location: serviceLocationSchema, equipment: equipmentSchema }[kind];
    const parsed = schema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form fields." };
    let customerId: string | undefined;
    if (kind === "contact" || kind === "location" || kind === "equipment") {
      customerId = id(form, "customerId");
      const parent = await client.from("customers").select("id").eq("tenant_id", tenantId).eq("id", customerId).maybeSingle();
      if (parent.error || !parent.data) throw new Error("Invalid customer.");
    }
    let locationId: string | undefined;
    if (kind === "equipment") {
      locationId = id(form, "locationId");
      const parent = await client.from("service_locations").select("id").eq("tenant_id", tenantId).eq("customer_id", customerId!).eq("id", locationId).maybeSingle();
      if (parent.error || !parent.data) throw new Error("Invalid location.");
    }
    const table = { customer: "customers", contact: "contacts", location: "service_locations", equipment: "equipment" }[kind];
    const result = await client.from(table).insert({ ...parsed.data, tenant_id: tenantId, ...(kind === "location" || kind === "contact" ? { customer_id: customerId } : {}), ...(kind === "equipment" ? { service_location_id: locationId } : {}) }).select("id").single();
    if (result.error || !result.data) throw new Error("Save failed.");
    revalidatePath(`/workspaces/${tenantId}`, "layout");
    return { status: "success", message: "Saved successfully." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to save. Check your permissions and form values, then try again." };
  }
}

export async function createCustomer(_previous: ActionState, form: FormData) { return mutate(form, "customer"); }
export async function createContact(_previous: ActionState, form: FormData) { return mutate(form, "contact"); }
async function updateCrmRecord(form: FormData, kind: "customer" | "contact"): Promise<ActionState> {
  try {
    const tenantId = id(form, "tenantId");
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const customerId = id(form, "customerId");
    const contactId = kind === "contact" ? id(form, "contactId") : undefined;
    const parsed = (kind === "customer" ? customerSchema : contactSchema).safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form fields." };

    const customer = await client.from("customers").select("id").eq("tenant_id", tenantId).eq("id", customerId).maybeSingle();
    if (customer.error || !customer.data) throw new Error("Invalid customer.");
    if (kind === "contact") {
      const contact = await client.from("contacts").select("id").eq("tenant_id", tenantId).eq("customer_id", customerId).eq("id", contactId!).maybeSingle();
      if (contact.error || !contact.data) throw new Error("Invalid contact.");
    }

    // Existing schemas strip identity/parent fields. Scope both lookup and write;
    // RLS and business-column grants independently enforce authorization.
    const result = kind === "customer"
      ? await client.from("customers").update(parsed.data).eq("tenant_id", tenantId).eq("id", customerId).select("id").single()
      : await client.from("contacts").update(parsed.data).eq("tenant_id", tenantId).eq("customer_id", customerId).eq("id", contactId!).select("id").single();
    if (result.error || !result.data) throw new Error("Save failed.");
    revalidatePath(`/workspaces/${tenantId}/customers/${customerId}`);
    revalidatePath(`/workspaces/${tenantId}/customers`);
    return { status: "success", message: kind === "customer" ? "Customer updated successfully." : "Contact updated successfully." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to update this record. Check your permissions and form values, then try again." };
  }
}
export async function updateCustomer(_previous: ActionState, form: FormData): Promise<ActionState> { return updateCrmRecord(form, "customer"); }
export async function updateContact(_previous: ActionState, form: FormData): Promise<ActionState> { return updateCrmRecord(form, "contact"); }
export async function createServiceLocation(_previous: ActionState, form: FormData) { return mutate(form, "location"); }
export async function updateServiceLocation(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const tenantId = id(form, "tenantId");
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const customerId = id(form, "customerId");
    const locationId = id(form, "locationId");
    const parsed = serviceLocationSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form fields." };

    const customer = await client.from("customers").select("id").eq("tenant_id", tenantId).eq("id", customerId).maybeSingle();
    if (customer.error || !customer.data) throw new Error("Invalid customer.");
    const location = await client.from("service_locations").select("id").eq("tenant_id", tenantId).eq("customer_id", customerId).eq("id", locationId).maybeSingle();
    if (location.error || !location.data) throw new Error("Invalid location.");

    // The schema strips untrusted identity fields; database grants and RLS also
    // protect record identity and authorize the mutation at execution time.
    const result = await client.from("service_locations").update(parsed.data).eq("tenant_id", tenantId).eq("customer_id", customerId).eq("id", locationId).select("id").single();
    if (result.error || !result.data) throw new Error("Save failed.");
    revalidatePath(`/workspaces/${tenantId}/customers/${customerId}`);
    return { status: "success", message: "Service location updated successfully." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to update this service location. Check your permissions and form values, then try again." };
  }
}
export async function createEquipment(_previous: ActionState, form: FormData) { return mutate(form, "equipment"); }
export async function updateEquipment(_previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const tenantId = id(form, "tenantId");
    const { client } = await requireMembership(tenantId, OFFICE_ROLES);
    const customerId = id(form, "customerId");
    const locationId = id(form, "locationId");
    const equipmentId = id(form, "equipmentId");
    const parsed = equipmentSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form fields." };

    const customer = await client.from("customers").select("id").eq("tenant_id", tenantId).eq("id", customerId).maybeSingle();
    if (customer.error || !customer.data) throw new Error("Invalid customer.");
    const location = await client.from("service_locations").select("id").eq("tenant_id", tenantId).eq("customer_id", customerId).eq("id", locationId).maybeSingle();
    if (location.error || !location.data) throw new Error("Invalid location.");
    const equipment = await client.from("equipment").select("id").eq("tenant_id", tenantId).eq("service_location_id", locationId).eq("id", equipmentId).maybeSingle();
    if (equipment.error || !equipment.data) throw new Error("Invalid equipment.");

    // Only validated business fields are written; identity and parent fields
    // remain protected by immutable grants and tenant RLS at write time.
    const result = await client.from("equipment").update(parsed.data).eq("tenant_id", tenantId).eq("service_location_id", locationId).eq("id", equipmentId).select("id").single();
    if (result.error || !result.data) throw new Error("Save failed.");
    revalidatePath(`/workspaces/${tenantId}/customers/${customerId}`);
    return { status: "success", message: "Equipment updated successfully." };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: "Unable to update this equipment. Check your permissions and form values, then try again." };
  }
}
export async function updateTenantSettings(previous: ActionState, form: FormData): Promise<ActionState> {
  void previous;
  void form;
  return { status: "error", message: "Workspace settings now save through the reviewed Setup/Settings path. Refresh Settings and save from the current form." };
}

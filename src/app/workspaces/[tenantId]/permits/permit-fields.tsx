"use client";

import { useRef } from "react";
import { Field } from "@/components/action-form";
import { permitStatusLabels, permitStatuses, type Permit } from "@/lib/permit-contracts";
import directory from "@/lib/permit-directory.json";

const commonScopes = [
 ["Electrical service upgrade", "Upgrade the existing electrical service. Record the existing and proposed amperage and equipment affected."],
 ["Electrical service replacement", "Replace the electrical service equipment at the existing location. Record the equipment and service rating."],
 ["Main panel replacement", "Replace the main panel and reconnect the affected circuits. Record the panel rating and circuit count."],
 ["Subpanel installation", "Install a subpanel and feeder. Record the proposed location, rating and circuits served."],
 ["Meter socket replacement", "Replace the meter socket. Record its rating, location and any utility coordination required."],
 ["Service mast repair", "Repair the service mast. Identify the mast, supports and weatherhead components affected."],
 ["Underground service installation", "Install an underground electrical service. Record the route, service rating and termination points."],
 ["Feeder replacement", "Replace the feeder between the identified equipment. Record the route, conductor details and equipment served."],
 ["Grounding and bonding repair", "Repair the identified grounding and bonding connections. Describe the components affected."],
 ["Branch circuit installation", "Install a branch circuit from the identified panel to the intended load. Record the circuit rating and location."],
 ["Kitchen circuit upgrade", "Install or modify kitchen circuits. Identify the outlets, appliances and circuits included."],
 ["Bathroom circuit upgrade", "Install or modify bathroom circuits. Identify the lighting, receptacles and equipment served."],
 ["Dedicated appliance circuit", "Install a dedicated circuit for the specified appliance. Record its location and circuit rating."],
 ["HVAC equipment circuit", "Install or modify the circuit serving the HVAC equipment. Identify the equipment and associated disconnect work."],
 ["Heat pump circuit", "Install a circuit for the specified heat pump. Identify the equipment location, circuit rating and disconnect work."],
 ["Electric water heater circuit", "Install a dedicated circuit for the electric water heater. Record the equipment location and circuit rating."],
 ["EV charger installation", "Install the specified EV charging equipment and supply circuit. Record the charger location and circuit rating."],
 ["Standby generator installation", "Install a standby generator and associated transfer equipment. Record the location, rating and loads served."],
 ["Transfer switch installation", "Install a transfer switch for the specified power source. Identify the switch rating, location and loads served."],
 ["Solar PV interconnection", "Connect the specified solar PV system to the electrical service. Record the equipment and proposed connection point."],
 ["Battery storage installation", "Install the specified battery storage equipment. Record the location, capacity and electrical connection."],
 ["Lighting retrofit", "Replace or modify the identified lighting and controls. List affected rooms, fixtures and circuits."],
 ["Exterior lighting installation", "Install exterior lighting and associated controls. Identify fixture locations and affected circuits."],
 ["Emergency lighting installation", "Install or replace emergency lighting fixtures. Identify the areas and circuits served."],
 ["Receptacle installation", "Install or replace receptacles at the identified locations. List affected rooms and circuits."],
 ["GFCI protection upgrade", "Add or replace GFCI protection on the identified outlets or circuits. List the locations covered."],
 ["Smoke and CO alarm wiring", "Install or modify wiring for smoke and carbon monoxide alarms. Identify device locations and circuits."],
 ["Commercial tenant fit-out", "Install electrical distribution, lighting and receptacles for the tenant fit-out. Identify the areas and equipment served."],
 ["Residential addition wiring", "Install wiring for the residential addition. List the rooms, circuits and equipment included."],
 ["Whole-home rewiring", "Replace wiring in the identified areas of the home. Describe circuits and electrical equipment affected."],
 ["Electrical demolition", "Disconnect and remove the identified electrical equipment and wiring. List the areas and circuits affected."],
 ["Temporary construction power", "Install temporary construction power. Record the service location, rating and equipment served."],
 ["Electrical equipment relocation", "Relocate the identified electrical equipment and reconnect the associated circuits. Record the original and proposed locations."],
 ["Motor or pump circuit", "Install or modify a circuit serving the specified motor or pump. Record equipment location and circuit details."],
 ["Sign circuit installation", "Install or modify the electrical circuit serving the identified sign. Record its location and associated controls."],
 ["Fire alarm wiring", "Install or modify the identified fire alarm wiring. List the affected devices, circuits and areas."],
] as const;

export function PermitFields({permit,jurisdictions=[]}:{permit?:Partial<Permit>;jurisdictions?:string[]}) {
 const scope = useRef<HTMLTextAreaElement>(null);
 const jurisdictionNames = [...new Set([...directory.map(entry => entry.name), ...jurisdictions])].sort((a,b)=>a.localeCompare(b));
 return <><Field name="title" label="Project name" required maxLength={160} defaultValue={permit?.title}/>
 <Field name="site" label="Service address" required maxLength={200} defaultValue={permit?.site}/>
 <label className="field"><span>Jurisdiction *</span><input name="jurisdiction" list="permit-jurisdictions" required maxLength={160} defaultValue={permit?.jurisdiction}/><datalist id="permit-jurisdictions">{jurisdictionNames.map(name=><option key={name} value={name}/>)}</datalist><small>Select a jurisdiction or type a new one.</small></label>
 <label className="field"><span>Add a common scope of work</span><select defaultValue="" onChange={event=>{
  const field = scope.current;
  const selection = commonScopes.find(([label]) => label === event.currentTarget.value)?.[1];
  if (field && selection) {
   const updated = [field.value.trim(), selection].filter(Boolean).join("\n\n");
   if (updated.length <= field.maxLength) field.value = updated;
  }
  event.currentTarget.value = "";
 }}><option value="">Choose common work</option>{commonScopes.map(([label])=><option key={label}>{label}</option>)}</select><small>Choosing a scope adds an editable description below.</small></label>
 <label className="field"><span>Electrical scope *</span><textarea ref={scope} name="scope" rows={5} required maxLength={4000} defaultValue={permit?.scope}/></label>
 {permit?.id&&<><label className="field"><span>Permit status</span><select name="status" defaultValue={permit.status}>{permitStatuses.map(s=><option key={s} value={s}>{permitStatusLabels[s]}</option>)}</select></label>
 <Field name="submitted_on" label="Actual submission date" type="date" defaultValue={permit.submitted_on??undefined}/>
 <Field name="permit_number" label="Town-issued permit number" maxLength={100} defaultValue={permit.permit_number}/>
 <Field name="next_followup" label="Next follow-up date" type="date" defaultValue={permit.next_followup??undefined}/>
 <Field name="closeout_reference" label="Final closure reference" maxLength={160} defaultValue={permit.closeout_reference}/>
 <Field name="closed_on" label="Actual closure date" type="date" defaultValue={permit.closed_on??undefined}/></>}
 </>;
}

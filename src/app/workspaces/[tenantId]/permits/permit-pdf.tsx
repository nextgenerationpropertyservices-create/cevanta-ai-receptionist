"use client";
import { useState, type FormEvent } from "react";
type PdfRuntime = { formInputs: Array<[string,string,string,boolean?,string?]>; fillTownForm:(lib:unknown, bytes:ArrayBuffer, fields:Record<string,string>)=>Promise<Uint8Array> };
let scriptPromise:Promise<unknown>|undefined;
function pdfLib(){
 return scriptPromise??=new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.src="/permitdesk/pdf-lib.min.js";
  script.onload=()=>{const lib=(window as Window&{PDFLib?:unknown}).PDFLib;if(lib)resolve(lib);else reject(new Error("PDF tools could not load."))};
  script.onerror=()=>reject(new Error("PDF tools could not load."));
  document.head.append(script);
 }).catch(e=>{scriptPromise=undefined;throw e});
}
export function PermitPdf({site,scope,firm,email}:{site:string;scope:string;firm:string;email:string}){
 const [message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function generate(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const values=Object.fromEntries([...new FormData(event.currentTarget)].map(([k,v])=>[k,String(v)]));
  setBusy(true);setMessage("");
  try {
   const path="/permitdesk/permit-form.mjs";
   const [runtime,lib,file]=await Promise.all([import(/* webpackIgnore: true */ /* turbopackIgnore: true */ path) as Promise<PdfRuntime>,pdfLib(),fetch("/permitdesk/winchendon-electrical.pdf")]);
   if(!file.ok)throw new Error("Could not load the town form.");
   if(runtime.formInputs.some(([key,,,required])=>required&&!values[key]?.trim())||!values.scope?.trim())throw new Error("Complete the required application details.");
   const bytes=await runtime.fillTownForm(lib,await file.arrayBuffer(),{...values,date:new Date().toLocaleDateString("en-CA",{timeZone:"America/New_York"})});
   const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:"application/pdf"}));
   const link=document.createElement("a");link.href=url;link.download="Winchendon-electrical-application-DRAFT.pdf";document.body.append(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),10000);setMessage("Draft downloaded. Review the remaining fields and sign before filing.");
  }catch(e){setMessage(e instanceof Error?e.message:"Could not generate the draft.")}
  finally{setBusy(false)}
 }
 return <details><summary>Generate Winchendon application PDF</summary><p>Uses this saved job’s scope and address. Application-only entries are used for this download and are not saved.</p><form className="form" method="post" onSubmit={generate}><fieldset disabled={busy}>
 {([["site","Street and number",site,true],["unit","Unit",""],["customer","Owner or tenant","",true],["firm","Contractor company",firm,true],["licensee","Responsible licensee","",true],["licenseNumber","License number","",true],["firmEmail","Contractor email",email,true]] as const).map(([key,label,value,required])=><label className="field" key={key}><span>{label}</span><input name={key} type={key==="firmEmail"?"email":"text"} defaultValue={value} required={required??false} maxLength={180}/></label>)}
 <label className="field"><span>Proposed electrical work</span><textarea name="scope" required maxLength={4000} defaultValue={scope}/></label>
 <button className="button" type="submit">{busy?"Preparing…":"Download unsigned PDF"}</button><p role="status">{message}</p></fieldset></form></details>;
}

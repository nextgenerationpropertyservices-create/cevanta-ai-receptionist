export const townFormSource="https://www.townofwinchendon.com/DocumentCenter/View/146/Electrical-Permit-PDF";
export function supportsTownForm(ahj){
 return ahj?.id==="ahj-ma-winchendon"&&/^winchendon\s*,?\s*ma$/i.test(ahj.name.trim());
}
export const formInputs=[
 ["site","Street and number","Location Street & Number",true],["unit","Unit","Unit No"],
 ["customer","Owner or tenant","Text32",true],["customerEmail","Owner or tenant email","Text33",false,"email"],
 ["customerAddress","Owner mailing address","Owner’s Address"],["customerPhone","Owner or tenant phone","Phone No"],
 ["buildingUse","Building use","Purpose of Building"],["buildingPermit","Related building permit number","Text35"],
 ["utilityAuthorization","Utility authorization number","Utility Authorization No"],["existingAmps","Existing service amps","Text42"],["newAmps","Proposed service amps","New Service"],
 ["estimatedValue","Estimated value of electrical work","Estimated Value of Electrical Work"],["startDate","Planned work start","Text31",false,"date"],
 ["firm","Contractor company","FIRM NAME",true],["firmLicense","Firm license number","LIC. No"],
 ["licensee","Responsible licensee name","Master/Systems Licensee",true],["licenseNumber","Responsible license number","LIC. No (1)",true],
 ["firmAddress","Contractor mailing address","Address"],["firmEmail","Contractor email","Email (1)",true,"email"],["firmPhone","Contractor phone","Telephone No"]
];
export function prefillForm(job,session,date){
 return {site:job.address||"",firm:session?.company||"",firmEmail:session?.email||"",scope:job.scope||"",date,buildingPermit:""};
}
const str=x=>String(x??"").trim();
const dateText=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)?x.slice(5,7)+"/"+x.slice(8)+"/"+x.slice(0,4):x;
export async function fillTownForm(lib,template,values){
 const {PDFDocument,StandardFonts,rgb}=lib;
 const pdf=await PDFDocument.load(template);
 const form=pdf.getForm();
 const font=await pdf.embedFont(StandardFonts.Helvetica);
 const clean=x=>Array.from(str(x)).map(c=>{
  try{font.encodeText(c);return c}catch{return null}
 }).join("");
 const put=(name,raw)=>{
  const value=str(raw);
  if(!value)return;
  const sanitized=clean(value);
  if(sanitized!==value)throw new Error("One of the application fields contains characters this town PDF cannot print. Use standard Latin characters for that field.");
  const f=form.getTextField(name);
  const minWidth=Math.min(...f.acroField.getWidgets().map(w=>w.getRectangle().width))-5;
  const size=Math.min(9,9*minWidth/font.widthOfTextAtSize(value,9));
  if(size<6)throw new Error("A value is too long for the town’s "+name+" field. Shorten it or enter the additional detail separately.");
  f.setText(value);f.acroField.setDefaultAppearance("/Helvetica "+size.toFixed(2)+" Tf 0 g");
 };
 put("City or Town of","Winchendon");put("Date",dateText(values.date));
 for(const [key,,name,,type] of formInputs)put(name,type==="date"?dateText(values[key]):values[key]);
 put("Print Name",values.licensee);
 const rawScope=str(values.scope);
 if(!rawScope)throw new Error("Add the proposed scope of work.");
 const scope=rawScope.replace(/\s+/g," ");
 if(clean(scope)!==scope)throw new Error("The scope contains characters this town PDF cannot print. Use standard Latin characters.");
 if(font.widthOfTextAtSize(scope,9)<=290){put("Description of Proposed Electrical Installation",scope)}
 else{
  put("Description of Proposed Electrical Installation","See attached scope of work (following pages).");
  let p,y;
  const newPage=()=>{
   p=pdf.addPage();p.setSize(612,792);y=738;
   p.drawText("Electrical permit application - scope of work",{x:48,y,font,size:15,color:rgb(.08,.19,.17)});y-=26;
  };
  newPage();
  for(const part of ["Service location: "+str(values.site)+(str(values.unit)?" / Unit "+str(values.unit):""),scope]){
   let line="";
   for(const word of part.split(" ")){
    if(font.widthOfTextAtSize(word,10)>505)throw new Error("A word in the scope is too long to print. Break it up and try again.");
    const next=line?line+" "+word:word;
    if(font.widthOfTextAtSize(next,10)>505){if(y<55)newPage();p.drawText(line,{x:48,y,font,size:10});y-=15;line=word}else line=next;
   }
   if(line){if(y<55)newPage();p.drawText(line,{x:48,y,font,size:10});y-=27}
  }
 }
 form.updateFieldAppearances(font);
 return pdf.save({updateFieldAppearances:false});
}

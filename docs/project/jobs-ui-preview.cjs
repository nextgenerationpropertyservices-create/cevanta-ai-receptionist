// Synthetic visual review only. No application fixture route or live data.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS helper uses Node's Module loader to review the actual TSX component. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const source = 'src/app/workspaces/[tenantId]/jobs/dispatch-board.tsx';
const compiled = ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const component = new Module(path.resolve(source));
component.filename = path.resolve(source);
component.paths = module.paths;
component.require = name => name === 'next/link' ? {__esModule:true,default:({href,children,...props})=>React.createElement('a',{href,...props},children)} : require(name);
component._compile(compiled,component.filename);
const jobs = [
 {id:'synthetic-one',title:'Seasonal HVAC tune-up',description:'Inspect and prepare the system for the colder months.',status:'scheduled',priority:'normal',scheduled_date:'2026-10-05',assigned_user_id:'synthetic-tech'},
 {id:'synthetic-two',title:'Heating system repair — a longer service request title to check narrow screens',description:'A fictional urgent request with enough detail to verify that the dispatch card stays readable on mobile.',status:'new',priority:'urgent',scheduled_date:null,assigned_user_id:null},
 {id:'synthetic-three',title:'Air filter replacement',description:'Routine maintenance completed.',status:'completed',priority:'low',scheduled_date:'2026-10-02',assigned_user_id:'synthetic-tech'}
];
function cssFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?cssFiles(path.join(dir,e.name)):e.name.endsWith('.css')?[path.join(dir,e.name)]:[]);}
const css = cssFiles('.next/static').map(p=>fs.readFileSync(p,'utf8')).join('\n');
const cards=renderToStaticMarkup(React.createElement(component.exports.DispatchBoard,{jobs,technicians:[{user_id:'synthetic-tech',display_name:'Demo Technician'}],tenantId:'synthetic-workspace',technicianView:false}));
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dispatch visual review — synthetic data</title><style>${css}\n.preview-wrap{max-width:1350px;margin:auto;padding:24px}</style></head><body><main class="preview-wrap"><span class="eyebrow">SYNTHETIC VISUAL REVIEW</span><h1>Jobs & dispatch</h1><p>Actual dispatch cards and production styles. Fictional records only.</p>${cards}</main></body></html>`;
fs.writeFileSync('docs/project/JOBS_UI_PREVIEW.html',html);
console.log('PASS synthetic dispatch preview generated from real component and compiled styles.');
if(process.argv.includes('--serve')) require('node:http').createServer((_req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);}).listen(3100,'127.0.0.1',()=>console.log('Synthetic preview available on loopback port 3100.'));

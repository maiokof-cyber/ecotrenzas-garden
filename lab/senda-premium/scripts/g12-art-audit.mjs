import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
const root=new URL('../public/assets/g12/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root),'utf8'));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
if(!same(manifest.node_layout,[[105,356],[295,288],[478,338],[667,263],[848,320]])||manifest.node_layout_modified)throw Error('G12 original node geometry altered');
if(Object.keys(manifest.assets).length!==3)throw Error('G12 expected exactly three separable assets');
let bytes=0;
for(const [name,entry] of Object.entries(manifest.assets)){
 const b=readFileSync(new URL(name,root));const sha=createHash('sha256').update(b).digest('hex');
 if(sha!==entry.sha256||b.length!==entry.bytes||b.readUInt32BE(16)!==1920||b.readUInt32BE(20)!==1080)throw Error(`G12 PNG mismatch ${name}`);
 bytes+=b.length;
}
if(bytes>2_500_000)throw Error('G12 mobile asset budget exceeded');
console.log('G12_ART_AUDIT_GREEN: independent painted terrain/route/garden, original node geometry, sha256, asset budget '+bytes);

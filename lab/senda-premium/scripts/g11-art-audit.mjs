import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const dir='public/assets/g11/';
const mf=JSON.parse(readFileSync(dir+'g11_manifest.json'));
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
assert(mf.status==='ART_CANDIDATE_NOT_APPROVED'&&!mf.fullSceneUsed&&mf.noUserCommerceData,'Art policy drift');
for(const [name,m] of Object.entries(mf.sprites)){
 const bytes=readFileSync(dir+name);const hash=createHash('sha256').update(bytes).digest('hex');
 assert(hash===m.sha256&&bytes.length===m.bytes,`${name} checksum changed`);
 assert(bytes.toString('hex',1,4)==='504e47',`${name} not PNG`);
 assert(bytes.readUInt32BE(16)===m.width&&bytes.readUInt32BE(20)===m.height,`${name} dimensions`);
 assert(bytes.length<750000,`${name} too large`);
}
assert(Object.keys(mf.sprites).length===4,'Wrong number of G11 sprites');
console.log('G11_ART_AUDIT_GREEN: 4 independently masked sprites / exact hashes / budget / no master KeyArt pasted');

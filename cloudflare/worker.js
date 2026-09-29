
export default {
 async fetch(request, env) {
  const url=new URL(request.url); const cors={'access-control-allow-origin':'*','access-control-allow-headers':'content-type,authorization','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS'};
  if(request.method==='OPTIONS')return new Response(null,{headers:cors});
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'content-type':'application/json'}});
  const body=async()=>{try{return await request.json()}catch{return {}}};
  const validSubmit=(b)=>b.token===env.SUBMIT_TOKEN;
  const requireAdmin=async()=>{const auth=request.headers.get('authorization')||'';const t=auth.replace('Bearer ','');if(!t)return false;const v=await env.LEARNING_KV.get('admin:'+t);return !!v};
  if(url.pathname==='/api/admin/login'&&request.method==='POST'){const b=await body();if(b.password!==env.ADMIN_PASSWORD)return json({error:'invalid'},401);const token=crypto.randomUUID();await env.LEARNING_KV.put('admin:'+token,'1',{expirationTtl:30*86400});return json({token})}
  if(url.pathname==='/api/submissions'&&request.method==='POST'){const b=await body();if(!validSubmit(b))return json({error:'forbidden'},403);const id=Date.now()+'-'+crypto.randomUUID();await env.LEARNING_KV.put('submission:'+id,JSON.stringify({...b,id}));return json({ok:true,id})}
  if(url.pathname==='/api/visibility'&&request.method==='GET'){const v=await env.LEARNING_KV.get('visibility','json');return json(v||{})}
  if(url.pathname==='/api/admin/overview'){if(!await requireAdmin())return json({error:'unauthorized'},401);const l=await env.LEARNING_KV.list({prefix:'submission:'});return json({submissions:l.keys.length})}
  if(url.pathname==='/api/admin/students'){if(!await requireAdmin())return json({error:'unauthorized'},401);const l=await env.LEARNING_KV.list({prefix:'submission:'});const out=[];for(const k of l.keys){const v=await env.LEARNING_KV.get(k.name,'json');if(v)out.push(v)}return json(out)}
  if(url.pathname==='/api/admin/stats'){if(!await requireAdmin())return json({error:'unauthorized'},401);return json({note:'Starter: Statistik-Aggregation wird als nächster Schritt ergänzt.'})}
  if(url.pathname==='/api/admin/timeline'){if(!await requireAdmin())return json({error:'unauthorized'},401);return json({note:'Starter: Zeitreihenansicht wird als nächster Schritt ergänzt.'})}
  if(url.pathname==='/api/admin/visibility'&&request.method==='GET'){if(!await requireAdmin())return json({error:'unauthorized'},401);return json(await env.LEARNING_KV.get('visibility','json')||{})}
  if(url.pathname==='/api/admin/visibility'&&request.method==='PUT'){if(!await requireAdmin())return json({error:'unauthorized'},401);const b=await body();await env.LEARNING_KV.put('visibility',JSON.stringify(b));return json({ok:true})}
  if(url.pathname.startsWith('/api/admin/materials')){if(!await requireAdmin())return json({error:'unauthorized'},401);return json({note:'Upload-API scaffold ready; binary upload will be implemented after account setup.'})}
  if(url.pathname.startsWith('/api/admin/images')){if(!await requireAdmin())return json({error:'unauthorized'},401);return json({note:'Image upload scaffold ready; binary upload will be implemented after account setup.'})}
  if(url.pathname==='/api/ai-feedback'&&request.method==='POST'){const b=await body();if(!validSubmit(b))return json({error:'forbidden'},403);if(!env.OPENAI_API_KEY)return json({error:'OPENAI_API_KEY missing'},503);return json({error:'AI endpoint scaffolded; model call intentionally added after deployment so rate-limit and privacy settings can be chosen.'},501)}
  if(url.pathname==='/api/qr'){return json({error:'QR endpoint scaffolded. Server-side generation + decoder verification will be added when Worker is deployed.'},501)}
  return json({ok:true,service:'learning-worker'});
 }
};

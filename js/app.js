
const API="https://api.mozambiquehe.re",$=i=>document.getElementById(i);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const fmt=n=>(n==null||n==="N/A"||isNaN(Number(n)))?"N/A":Number(n).toLocaleString();
const say=(t,e)=>{$("msg").textContent=t||"";$("msg").className=e?"err":""};
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

// legend marquee
const names=["Bangalore","Bloodhound","Caustic","Crypto","Fuse","Gibraltar","Horizon","Lifeline","Loba","Mad Maggie","Mirage","Newcastle","Octane","Pathfinder","Rampart","Revenant","Seer","Valkyrie","Vantage","Wattson","Wraith","Ash","Ballistic","Conduit","Alter"];
$("mq")?.append(...[...names,...names].map(n=>el("span",null,n)));

// reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.15});
const watch=r=>(r||document).querySelectorAll(".rv:not(.in)").forEach(n=>io.observe(n));
watch();

// count up
function countUp(node,to){
  if(reduce||isNaN(to)){node.textContent=fmt(to);return}
  const t0=performance.now(),d=1400;
  (function f(t){const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,4);node.textContent=Math.round(to*e).toLocaleString();if(p<1)requestAnimationFrame(f)})(t0);
}
const numNode=(cls,v)=>{const b=el("b",cls);b.dataset.v=v;b.textContent="0";return b};
function runCounts(root){
  const co=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){countUp(e.target,Number(e.target.dataset.v));co.unobserve(e.target)}}),{threshold:.5});
  root.querySelectorAll("[data-v]").forEach(n=>{if(isNaN(Number(n.dataset.v)))n.textContent="N/A";else co.observe(n)});
}

async function call(path,params){
  const q=new URLSearchParams({...params,auth:API_KEY});
  const r=await fetch(`${API}/${path}?${q}`),d=await r.json().catch(()=>({}));
  if(!r.ok||d.Error)throw new Error(d.Error||`Request failed (${r.status})`);
  return d;
}

function renderRecent(){
  const b=$("recent");if(!b)return;b.replaceChildren();
  store.get("apex_recent",[]).forEach(r=>{const c=el("button","chip",`${r.player} on ${r.platform}`);c.type="button";c.onclick=()=>{$("player").value=r.player;$("platform").value=r.platform;lookup()};b.append(c)});
}
function remember(p,pl){
  const l=store.get("apex_recent",[]).filter(r=>!(r.player.toLowerCase()===p.toLowerCase()&&r.platform===pl));
  l.unshift({player:p,platform:pl});store.set("apex_recent",l.slice(0,6));renderRecent();
}

function renderPlayer(d){
  const g=d.global||{},rt=d.realtime||{},rk=g.rank||{},out=$("out");
  out.replaceChildren();
  const left=el("div","panel rv"),right=el("div","panel rv");right.style.setProperty("--d",".12s");
  left.append(el("div","pname",g.name||"Unknown"));
  const st=el("div","state");st.append(el("i",rt.isOnline?"on":""),el("span",null,`${rt.isOnline?(rt.currentState||"Online"):"Offline"}, ${g.platform||""}`));
  left.append(st,el("div",null,"Level"),numNode("big",Number(g.level)));
  const bar=el("div","bar"),fill=el("i");bar.append(fill);left.append(bar);
  left.append(el("small",null,`${g.toNextLevelPercent||0}% to level ${(Number(g.level)||0)+1}`));
  setTimeout(()=>fill.style.width=Math.min(100,Number(g.toNextLevelPercent)||0)+"%",200);
  right.append(el("div",null,"Ranked"));
  const r=el("div","rank");
  if(rk.rankImg){const i=el("img");i.src=rk.rankImg;i.alt=rk.rankName||"Rank";r.append(i)}
  const t=el("div");
  const hi=["Apex Predator","Master"].includes(rk.rankName);
  t.append(el("b",null,`${rk.rankName||"Unranked"} ${hi?"":(rk.rankDiv||"")}`.trim()));
  const rp=numNode("big",Number(rk.rankScore));t.append(rp,el("span",null," RP"));
  r.append(t);right.append(r);
  const top=el("div","profile");top.append(left,right);out.append(top);

  const tot=d.total||{},keys=Object.keys(tot);
  if(keys.length){
    const c=el("div","panel rv");c.append(el("h3",null,"Lifetime totals"));c.firstChild.style.cssText="font-size:30px;margin-bottom:18px";
    const g2=el("div","totals");
    keys.forEach(k=>{const x=el("div","tot");x.append(numNode("",Number(tot[k].value)),el("span",null,tot[k].name||k));g2.append(x)});
    c.append(g2);out.append(c);
  }
  const all=(d.legends&&d.legends.all)||{},sel=d.legends&&d.legends.selected&&d.legends.selected.LegendName;
  const ln=Object.keys(all).filter(n=>n!=="Global"&&Array.isArray(all[n].data)&&all[n].data.length).sort((a,b)=>a===sel?-1:b===sel?1:a.localeCompare(b));
  const wrap=el("div","legends");
  ln.forEach((n,i)=>{
    const L=all[n],c=el("div",n===sel?"lg sel rv":"lg rv");c.style.setProperty("--d",(i%4)*.08+"s");
    const h=el("div","hd"),img=L.ImgAssets&&(L.ImgAssets.banner||L.ImgAssets.icon);if(img)h.style.backgroundImage=`url("${img}")`;
    c.append(h,el("h3",null,n));
    const ul=el("ul");L.data.forEach(s=>{const li=el("li");li.append(el("span",null,s.name),numNode("",Number(s.value)));li.lastChild.style.fontWeight="500";ul.append(li)});
    c.append(ul);wrap.append(c);
  });
  out.append(ln.length?wrap:el("p","lead","No trackers are equipped on this account yet. Equip some in game and they will appear here."));
  $("lookup").hidden=false;
  watch(out);runCounts(out);
  setTimeout(()=>$("lookup").scrollIntoView({behavior:"smooth"}),150);
}

let timers=[];
function renderMaps(m){
  timers.forEach(clearInterval);timers=[];
  const grid=$("mapsGrid");grid.replaceChildren();
  [["battle_royale","Pubs"],["ranked","Ranked"],["ltm","Mixed tape"]].forEach(([k,lab],i)=>{
    const o=m[k];if(!o||!o.current)return;
    const c=el("div","mp rv");c.style.setProperty("--d",i*.12+"s");
    if(o.current.asset)c.style.backgroundImage=`url("${o.current.asset}")`;
    const cd=el("div","cd");
    const tick=()=>{let s=Math.max(0,o.current.end-Math.floor(Date.now()/1000));cd.textContent=`${Math.floor(s/3600)}:${String(Math.floor(s%3600/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`};
    tick();timers.push(setInterval(tick,1000));
    c.append(el("div","md",lab),el("h3",null,o.current.map||"Unknown"),cd,el("div","nx",o.next?`Next: ${o.next.map}`:""));
    grid.append(c);
  });
  $("mapsNote").textContent="Current maps and time left until the next rotation.";
  watch(grid);
}

async function lookup(){
  const player=$("player").value.trim(),platform=$("platform").value;
  if(!player)return;
  say("Loading player data");
  try{
    const p=await call("bridge",{player,platform});
    renderPlayer(p);remember(p.global?.name||player,platform);say("");
  }catch(e){say(API_KEY.startsWith("PASTE")?"This site has no API key yet. Add one at the top of the script.":`${e.message}. Check the player name and platform, then try again.`,true)}
}
$("f")?.addEventListener("submit",e=>{e.preventDefault();lookup()});
renderRecent();
async function loadMaps(){
  try{renderMaps(await call("maprotation",{version:2}))}
  catch(e){$("mapsNote").textContent=API_KEY.startsWith("PASTE")?"Add your API key at the top of the script to load the rotation.":"The map rotation could not be loaded right now."}
}

// ---- pages ----
const cache={};
const cached=async(k,p,q)=>cache[k]||(cache[k]=await call(p,q));
const keyMsg=e=>API_KEY.startsWith("PASTE")?"This site has no API key yet. Add one at the top of the script.":`${e.message}. Try again in a moment.`;
const panel=(...k)=>{const p=el("div","panel rv");p.append(...k);return p};
const head=t=>{const h=el("h3",null,t);h.style.cssText="font-size:30px;margin-bottom:14px";return h};
const safe=u=>/^https?:\/\//.test(u||"");

async function loadHome(){
  const box=$("live");
  try{
    const [m,pr]=await Promise.all([cached("maps","maprotation",{version:2}),cached("pred","predator",{})]);
    box.replaceChildren();
    [["Pubs right now",m.battle_royale?.current?.map],["Ranked right now",m.ranked?.current?.map]].forEach(([l,v],i)=>{
      const p=panel(el("span","lbl2",l),el("div","big",v||"Unknown"));p.style.setProperty("--d",i*.1+"s");box.append(p)});
    const p=panel(el("span","lbl2","PC Predator cutoff"),numNode("big",Number(pr.RP?.PC?.val)),el("div","sm","RP"));
    p.style.setProperty("--d",".2s");box.append(p);watch(box);runCounts(box);
  }catch(e){box.textContent=keyMsg(e)}
}
async function loadRanked(){
  const g=$("rpGrid");
  try{
    const d=await cached("pred","predator",{});g.replaceChildren();
    [["PC","PC"],["PlayStation","PS4"],["Xbox","X1"],["Switch","SWITCH"]].forEach(([l,k],i)=>{
      const x=d.RP&&d.RP[k];if(!x)return;
      const p=panel(head(l),numNode("big",Number(x.val)),el("div","sm","RP for Apex Predator"),el("div","sm",`${fmt(x.totalMastersAndPreds)} Masters and Predators`));
      p.style.setProperty("--d",i*.08+"s");g.append(p)});
    watch(g);runCounts(g);
  }catch(e){g.textContent=keyMsg(e)}
}
async function loadNews(){
  const g=$("newsGrid");
  try{
    const d=await cached("news","news",{lang:"en-us"});g.replaceChildren();
    d.filter(n=>safe(n.link)).slice(0,12).forEach((n,i)=>{
      const a=el("a","nw rv");a.href=n.link;a.target="_blank";a.rel="noopener";a.style.setProperty("--d",(i%3)*.1+"s");
      if(safe(n.img)){const im=el("img");im.src=n.img;im.alt="";im.loading="lazy";a.append(im)}
      const t=el("div","t");t.append(el("h3",null,n.title||""),el("p",null,n.short_desc||""));a.append(t);g.append(a)});
    watch(g);
  }catch(e){g.textContent=keyMsg(e)}
}
async function loadStatus(){
  const g=$("svGrid");
  try{
    const d=await call("servers",{});g.replaceChildren();
    Object.entries(d).forEach(([grp,regs],i)=>{
      if(!regs||typeof regs!=="object")return;
      const p=panel(head(grp.replace(/_/g," "))),ul=el("ul","st");
      Object.entries(regs).forEach(([r,v])=>{
        const li=el("li");li.append(el("i",v&&v.Status==="UP"?"on":""),el("span",null,r),el("em",null,v&&v.ResponseTime!=null?v.ResponseTime+" ms":(v&&v.Status)||""));ul.append(li)});
      p.append(ul);p.style.setProperty("--d",(i%3)*.08+"s");g.append(p)});
    watch(g);
  }catch(e){g.textContent=keyMsg(e)}
}
const rows=d=>{const g=d.global||{},o={Level:+g.level,"Rank score":+(g.rank&&g.rank.rankScore)};Object.values(d.total||{}).forEach(t=>o[t.name]=Number(t.value));return o};
function renderCompare(x,y){
  const A=rows(x),B=rows(y),out=$("cout");out.replaceChildren();
  const t=el("table","cmp"),h=el("tr");
  ["",x.global?.name,y.global?.name].forEach(c=>h.append(el("th",null,c||"")));t.append(h);
  Object.keys(A).filter(k=>k in B).forEach(k=>{
    const r=el("tr");r.append(el("td",null,k),el("td",A[k]>B[k]?"w":"",fmt(A[k])),el("td",B[k]>A[k]?"w":"",fmt(B[k])));t.append(r)});
  const w=panel(t);w.style.overflowX="auto";out.append(w);watch(out);
}
$("cf")?.addEventListener("submit",async e=>{
  e.preventDefault();const m=$("cmsg");m.className="";m.textContent="Loading";
  try{
    const [x,y]=await Promise.all([call("bridge",{player:$("ca").value.trim(),platform:$("cap").value}),call("bridge",{player:$("cb").value.trim(),platform:$("cbp").value})]);
    renderCompare(x,y);m.textContent="";
  }catch(err){m.className="err";m.textContent=keyMsg(err)}
});
$("hf")?.addEventListener("submit",e=>{
  e.preventDefault();
  location.href="players.html?player="+encodeURIComponent($("hp").value.trim())+"&platform="+$("hpl").value;
});
const page=document.body.dataset.page;
document.querySelectorAll("nav ul a").forEach(a=>a.classList.toggle("act",a.dataset.r===page));
({home:loadHome,maps:loadMaps,ranked:loadRanked,news:loadNews,status:loadStatus}[page]||(()=>{}))();
if(page==="players"){
  const q=new URLSearchParams(location.search);
  if(q.get("player")){$("player").value=q.get("player");$("platform").value=q.get("platform")||"PC";lookup()}
}

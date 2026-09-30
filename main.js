
const dockLinks=[...document.querySelectorAll(".dock a")];
function setActive(id){dockLinks.forEach(a=>{const on=a.getAttribute("href")==="#"+id;a.classList.toggle("active",on);if(on)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current")})}
const dockIds=new Map([[document.getElementById("about"),"about"],[document.getElementById("features"),"features"],[document.getElementById("demo"),"demo"]]);
let dockLock=false,dockTimer;
const unlockDock=()=>{dockLock=false;clearTimeout(dockTimer)};
const dockIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!dockLock)setActive(dockIds.get(e.target))}),{rootMargin:"-45% 0px -45% 0px"});
dockIds.forEach((_,el)=>dockIO.observe(el));
dockLinks.forEach(a=>a.addEventListener("click",e=>{
  const id=a.getAttribute("href").slice(1),t=document.getElementById(id);
  if(!t)return;
  e.preventDefault();
  dockLock=true;clearTimeout(dockTimer);dockTimer=setTimeout(unlockDock,1200);
  setActive(id);
  t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  history.replaceState(null,"","#"+id);
}));
addEventListener("scrollend",unlockDock);
const embed=t=>"https://www.google.com/maps?q="+encodeURIComponent(t)+"&output=embed";
const home=embed("Cebu Institute of Technology University Cebu City");
const spots=[
 {n:"Uncle Brew Prime CIT-U",a:"Near the CIT-U campus, Cebu City",r:[["Wifi","4.2"],["Price","4.6"],["Service","4.3"],["Quiet","3.9"]],m:"Uncle Brew Prime CIT-U Cebu City"},
 {n:"Mindspace Study Hub",a:"Urgello, Cebu City",r:[["Wifi","4.7"],["Price","4.5"],["Service","4.4"],["Quiet","4.8"]],m:"Mindspace Study Hub Urgello Cebu City"},
 {n:"TOMORO COFFEE - Elizabeth Mall (E-Mall)",a:"G/F E2, Elizabeth Mall, N. Bacalso Ave, Cebu City",r:[["Wifi","4.0"],["Price","4.4"],["Service","4.5"],["Quiet","3.8"]],m:"TOMORO COFFEE Elizabeth Mall Cebu 7Q257VXW+84"}
];
const log=document.getElementById("log"),send=document.getElementById("send"),ask=document.getElementById("ask"),
 replay=document.getElementById("replay"),gmap=document.getElementById("gmap"),card=document.getElementById("mcard");
function bub(cls,txt){const b=document.createElement("div");b.className="bub "+cls;if(txt)b.textContent=txt;log.appendChild(b);log.scrollTop=log.scrollHeight;return b}
function pick(i,btns){
  btns.forEach((b,j)=>b.setAttribute("aria-pressed",j===i));
  const o=spots[i];gmap.src=embed(o.m);
  card.innerHTML="";
  const h=document.createElement("h3");h.textContent=o.n;
  const p=document.createElement("p");p.textContent=o.a;
  const r=document.createElement("div");r.className="r";
  o.r.forEach(([k,v])=>{const d=document.createElement("div");const b=document.createElement("b");b.textContent=v;d.append(b,k);r.appendChild(d)});
  card.append(h,p,r);card.classList.add("show");
}
function reset(){
  log.innerHTML="";bub("bot","Hi! Tell me what kind of study spot you need and I will find the nearest ones.");
  gmap.src=home;card.classList.remove("show");
  send.disabled=false;replay.style.display="none";
}
send.addEventListener("click",()=>{
  send.disabled=true;bub("me",ask.value);
  const t=bub("bot");t.classList.add("typing");t.innerHTML="<span></span><span></span><span></span>";
  setTimeout(()=>{
    t.classList.remove("typing");t.textContent="Here are 3 cafes near CIT-U.";
    const res=document.createElement("div");res.className="res";
    const btns=spots.map((o,i)=>{
      const b=document.createElement("button");b.type="button";
      const n=document.createElement("b");n.textContent=o.n;
      const m=document.createElement("small");m.textContent=o.a;
      b.append(n,m);b.addEventListener("click",()=>pick(i,btns));res.appendChild(b);return b});
    log.appendChild(res);log.scrollTop=log.scrollHeight;
    pick(0,btns);replay.style.display="inline-block";
  },1000);
});
replay.addEventListener("click",reset);
reset();
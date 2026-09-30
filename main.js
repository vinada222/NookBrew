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

//Google Maps embeded
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
  const r=document.createElement("div");r.className="rating-list";r.setAttribute("aria-label","Location ratings out of five stars");
  o.r.forEach(([k,v])=>{
    const score=Number(v);
    const row=document.createElement("div");row.className="rating-row";
    const label=document.createElement("span");label.className="rating-label";label.textContent=k;
    const track=document.createElement("div");track.className="rating-track";track.setAttribute("role","progressbar");track.setAttribute("aria-label",k+" rating");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","5");track.setAttribute("aria-valuenow",String(score));track.setAttribute("aria-valuetext",score+" out of 5 stars");
    const fill=document.createElement("span");fill.className="rating-fill";fill.style.width=(score/5*100)+"%";track.appendChild(fill);
    const value=document.createElement("span");value.className="rating-score";value.textContent=score.toFixed(1)+" / 5 stars";
    row.append(label,track,value);r.appendChild(row);
  });
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

//Waitlist - I'll use supabase for my back-end
(() => {
  // Put your form or API address here (Supabase or your own backend).

  const WAITLIST_ENDPOINT = "";

  const dlg = document.getElementById("waitlist");
  if (!dlg || typeof dlg.showModal !== "function") return;

  const form = dlg.querySelector("#wl-form");
  const email = dlg.querySelector("#wl-email");
  const errorEl = dlg.querySelector("#wl-error");
  const submit = dlg.querySelector("#wl-submit");
  const formView = dlg.querySelector("#wl-form-view");
  const successView = dlg.querySelector("#wl-success");
  const submitLabel = submit.textContent;

  const setError = (msg) => {
    errorEl.textContent = msg;
    email.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const reset = () => {
    form.reset();
    setError("");
    successView.hidden = true;
    formView.hidden = false;
  };

  // Open from any button with data-open-waitlist
  document.querySelectorAll("[data-open-waitlist]").forEach((btn) => {
    btn.addEventListener("click", () => {
      dlg.showModal();
      document.documentElement.classList.add("wl-open");
      email.focus();
    });
  });

  // X button, the "Back to NookBrew" button
  dlg.querySelectorAll("[data-close-waitlist]").forEach((btn) => {
    btn.addEventListener("click", () => dlg.close());
  });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });

  dlg.addEventListener("close", () => {
    document.documentElement.classList.remove("wl-open");
    reset();
  });

  email.addEventListener("input", () => setError(""));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = email.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email, like name@example.com.");
      email.focus();
      return;
    }

    setError("");
    submit.disabled = true;
    submit.textContent = "Saving...";

    try {
      if (WAITLIST_ENDPOINT) {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        if (!res.ok) throw new Error("Request failed");
      }
      formView.hidden = true;
      successView.hidden = false;
      successView.focus();
    } catch (err) {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      submit.disabled = false;
      submit.textContent = submitLabel;
    }
  });
})();
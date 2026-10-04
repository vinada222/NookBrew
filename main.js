// Navigation + section active states
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

// Demo cafe data + Google Maps embed
const embed=t=>"https://www.google.com/maps?q="+encodeURIComponent(t)+"&output=embed";
const home=embed("Cebu Institute of Technology University Cebu City");
const spots=[
 {n:"Uncle Brew Prime CIT-U",a:"Near the CIT-U campus, Cebu City",r:[["Wifi","4.2"],["Price","4.6"],["Service","4.3"],["Quiet","3.9"]],charging:false,wifiRequiresOrder:true,openNow:true,hours:"7 AM-10 PM",distance:"0.3 km",travelTime:"4 min walk",priceRange:"₱",m:"Uncle Brew Prime CIT-U Cebu City"},
 {n:"Mindspace Study Hub",a:"Urgello, Cebu City",r:[["Wifi","4.7"],["Price","4.5"],["Service","4.4"],["Quiet","4.8"]],charging:true,wifiRequiresOrder:false,openNow:true,hours:"8 AM-11 PM",distance:"0.7 km",travelTime:"9 min walk",priceRange:"₱₱",m:"Mindspace Study Hub Urgello Cebu City"},
 {n:"TOMORO COFFEE - Elizabeth Mall (E-Mall)",a:"G/F E2, Elizabeth Mall, N. Bacalso Ave, Cebu City",r:[["Wifi","4.0"],["Price","4.4"],["Service","4.5"],["Quiet","3.8"]],charging:true,wifiRequiresOrder:true,openNow:false,hours:"10 AM-9 PM",distance:"1.2 km",travelTime:"6 min drive",priceRange:"₱₱",m:"TOMORO COFFEE Elizabeth Mall Cebu 7Q257VXW+84"}
];
const savedSpotNames=new Set();


const gmap=document.getElementById("gmap"),card=document.getElementById("mcard"),explorer=document.querySelector(".explorer"),
 resultsView=document.getElementById("results-view"),spotResults=document.getElementById("spot-results"),
 spotCount=document.getElementById("spot-count"),searchInput=document.getElementById("spot-search"),
 openFilter=document.getElementById("open-filter"),brewyToggle=document.getElementById("brewy-toggle"),
 brewyChat=document.getElementById("brewy-chat"),brewyClose=document.getElementById("brewy-close"),
 brewyForm=document.getElementById("brewy-form"),brewyPrompt=document.getElementById("brewy-prompt"),
 brewyMessages=document.getElementById("brewy-messages"),brewyDragHandle=document.getElementById("brewy-drag-handle");
let openOnly=false;
let brewyDrag=null;

function averageRating(spot){return(spot.r.reduce((total,[,score])=>total+Number(score),0)/spot.r.length).toFixed(1)}
function addResultMeta(parent,iconName,text){
  const item=document.createElement("span");
  const icon=document.createElement("span");icon.className="msr";icon.setAttribute("aria-hidden","true");icon.textContent=iconName;
  item.append(icon,document.createTextNode(text));parent.appendChild(item);
}
// Render cafe results list
function renderResults(){
  const query=searchInput.value.trim().toLowerCase();
  const matches=spots.map((spot,index)=>({spot,index})).filter(({spot})=>{
    const matchesQuery=(spot.n+" "+spot.a).toLowerCase().includes(query);
    return matchesQuery&&(!openOnly||spot.openNow);
  });
  spotResults.replaceChildren();
  spotCount.textContent=matches.length+" "+(matches.length===1?"cafe":"cafes");
  if(!matches.length){
    const empty=document.createElement("p");empty.className="empty-results";empty.textContent="No cafes match that search.";spotResults.appendChild(empty);return;
  }
  matches.forEach(({spot,index})=>{
    const button=document.createElement("button");button.type="button";button.className="spot-result";button.dataset.index=String(index);button.setAttribute("aria-pressed","false");
    const top=document.createElement("span");top.className="result-top";
    const name=document.createElement("strong");name.className="result-name";name.textContent=spot.n;
    const status=document.createElement("span");status.className="result-status";status.dataset.open=String(spot.openNow);status.textContent=spot.openNow?"OPEN":"CLOSED";
    top.append(name,status);
    const address=document.createElement("span");address.className="result-address";address.textContent=spot.a;
    const meta=document.createElement("span");meta.className="result-meta";
    addResultMeta(meta,"near_me",spot.distance);
    addResultMeta(meta,"wifi",spot.wifiRequiresOrder?"Wi-Fi order":"Wi-Fi");
    addResultMeta(meta,"power",spot.charging?"Charging":"No ports");
    addResultMeta(meta,"payments",spot.priceRange);
    const rating=document.createElement("span");rating.className="result-rating";
    const star=document.createElement("span");star.className="msr";star.setAttribute("aria-hidden","true");star.textContent="star";
    rating.append(star,document.createTextNode(averageRating(spot)));
    top.appendChild(rating);button.append(top,address,meta);
    button.addEventListener("click",()=>pick(index));spotResults.appendChild(button);
  });
}
// Detail card + favorites
function showResults(){card.hidden=true;card.classList.remove("show");resultsView.hidden=false}
function pick(index){
  const spot=spots[index];gmap.src=embed(spot.m);
  spotResults.querySelectorAll(".spot-result").forEach(button=>button.setAttribute("aria-pressed",String(Number(button.dataset.index)===index)));
  resultsView.hidden=true;card.hidden=false;card.innerHTML="";
  const back=document.createElement("button");back.type="button";back.className="detail-back";
  const backIcon=document.createElement("span");backIcon.className="msr";backIcon.setAttribute("aria-hidden","true");backIcon.textContent="arrow_back";
  back.append(backIcon,document.createTextNode("All cafes"));back.addEventListener("click",showResults);
  const head=document.createElement("div");head.className="mcard-head";
  const title=document.createElement("h3");title.textContent=spot.n;
  const favorite=document.createElement("button");favorite.type="button";favorite.className="favorite-button";
  const favoriteIcon=document.createElement("span");favoriteIcon.className="msr";favoriteIcon.setAttribute("aria-hidden","true");
  const updateFavorite=()=>{const saved=savedSpotNames.has(spot.n);favorite.setAttribute("aria-pressed",String(saved));favorite.setAttribute("aria-label",saved?"Remove from saved spots":"Save spot");favorite.title=saved?"Remove from saved spots":"Save spot";favoriteIcon.textContent=saved?"favorite":"favorite_border"};
  updateFavorite();favorite.appendChild(favoriteIcon);
  favorite.addEventListener("click",()=>{if(savedSpotNames.has(spot.n))savedSpotNames.delete(spot.n);else savedSpotNames.add(spot.n);updateFavorite()});
  head.append(title,favorite);
  const address=document.createElement("p");address.textContent=spot.a;
  const details=document.createElement("div");details.className="spot-info";details.setAttribute("aria-label","Cafe details");
  const addFact=(iconName,labelText,valueText,detailText,className="")=>{
    const fact=document.createElement("div");fact.className="spot-fact"+(className?" "+className:"");
    if(className==="spot-open")fact.dataset.open=String(spot.openNow);
    const icon=document.createElement("span");icon.className="msr spot-fact-icon";icon.setAttribute("aria-hidden","true");icon.textContent=iconName;
    const label=document.createElement("span");label.className="spot-fact-label";label.textContent=labelText;
    const value=document.createElement("strong");value.className="spot-fact-value";value.textContent=valueText;
    const detail=document.createElement("span");detail.className="spot-fact-detail";detail.textContent=detailText;
    fact.append(icon,label,value,detail);details.appendChild(fact);
  };
  addFact("storefront","Hours",spot.openNow?"Open now":"Closed",spot.hours,"spot-open");
  addFact("near_me","Distance",spot.distance,spot.travelTime+" from CIT-U demo origin");
  const priceDetails={"₱":"Under ₱100 per person","₱₱":"₱100-₱250 per person","₱₱₱":"Over ₱250 per person"};
  addFact("payments","Price range",spot.priceRange,priceDetails[spot.priceRange]||"Estimated per-person spend");
  const links=document.createElement("div");links.className="spot-links";links.setAttribute("aria-label","Cafe links");
  const linkOptions=[
    ["menu_book","Menu",spot.n+" Cebu City menu"],
    ["share","Socials",spot.n+" Cebu City official Facebook Instagram"],
    ["language","Website",spot.n+" Cebu City official website"]
  ];
  linkOptions.forEach(([iconName,labelText,query])=>{
    const link=document.createElement("a");link.className="spot-link";link.href="https://www.google.com/search?q="+encodeURIComponent(query);link.target="_blank";link.rel="noopener noreferrer";
    const icon=document.createElement("span");icon.className="msr";icon.setAttribute("aria-hidden","true");icon.textContent=iconName;
    const label=document.createElement("span");label.textContent=labelText;
    const external=document.createElement("span");external.className="msr spot-link-external";external.setAttribute("aria-hidden","true");external.textContent="open_in_new";
    link.append(icon,label,external);links.appendChild(link);
  });
  const ratings=document.createElement("div");ratings.className="rating-list";ratings.setAttribute("aria-label","Location ratings out of five stars");
  const ratingIcons={Wifi:"wifi",Price:"payments",Service:"room_service",Quiet:"spa"};
  spot.r.forEach(([labelText,rawScore])=>{
    const score=Number(rawScore),row=document.createElement("div");row.className="rating-row";
    const category=document.createElement("span");category.className="rating-category";
    const icon=document.createElement("span");icon.className="msr rating-icon";icon.setAttribute("aria-hidden","true");icon.textContent=ratingIcons[labelText]||"star";
    const label=document.createElement("span");label.className="rating-label";label.textContent=labelText;category.append(icon,label);
    const track=document.createElement("div");track.className="rating-track";track.setAttribute("role","progressbar");track.setAttribute("aria-label",labelText+" rating");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","5");track.setAttribute("aria-valuenow",String(score));track.setAttribute("aria-valuetext",score+" out of 5 stars");
    const fill=document.createElement("span");fill.className="rating-fill";fill.style.width=(score/5*100)+"%";track.appendChild(fill);
    const value=document.createElement("span");value.className="rating-score";value.textContent=score.toFixed(1)+" / 5 stars";
    row.append(category,track,value);ratings.appendChild(row);
  });
  const amenities=document.createElement("div");amenities.className="amenity-list";
  const addAmenity=(labelText,iconName,enabled,yesText,noText)=>{
    const row=document.createElement("div");row.className="amenity-row";
    const name=document.createElement("span");name.className="amenity-name";
    const icon=document.createElement("span");icon.className="msr rating-icon";icon.setAttribute("aria-hidden","true");icon.textContent=iconName;
    const label=document.createElement("span");label.textContent=labelText;name.append(icon,label);
    const status=document.createElement("span");status.className="amenity-status";status.dataset.available=String(enabled);
    const statusIcon=document.createElement("span");statusIcon.className="msr";statusIcon.setAttribute("aria-hidden","true");statusIcon.textContent=enabled?"check_circle":"cancel";
    const statusText=document.createElement("span");statusText.textContent=enabled?yesText:noText;status.append(statusIcon,statusText);
    row.append(name,status);amenities.appendChild(row);
  };
  addAmenity("Wi-Fi requires purchase/order","wifi",spot.wifiRequiresOrder,"Yes","No");
  addAmenity("Charging ports","power",spot.charging,"Available","Unavailable");
  card.append(back,head,address,details,links,ratings,amenities);card.classList.add("show");
}
searchInput.addEventListener("input",renderResults);
openFilter.addEventListener("click",()=>{openOnly=!openOnly;openFilter.setAttribute("aria-pressed",String(openOnly));renderResults()});
renderResults();
function appendBrewyMessage(text,kind){
  const message=document.createElement("p");message.className="brewy-message "+kind;message.textContent=text;brewyMessages.appendChild(message);
  brewyMessages.scrollTop=brewyMessages.scrollHeight;
}
function getBrewyMatches(query){
  const normalized=query.toLowerCase();
  const asksQuiet=["quiet","calm","focus","peaceful"].some(term=>normalized.includes(term));
  const asksWifi=["wifi","wi-fi","internet","online"].some(term=>normalized.includes(term));
  const asksBudget=["budget","cheap","affordable","price"].some(term=>normalized.includes(term));
  const asksCharging=["charging","power","outlet","plug"].some(term=>normalized.includes(term));
  const asksOpen=["open","now"].some(term=>normalized.includes(term));
  const asksNearest=["nearest","closest","nearby","near"].some(term=>normalized.includes(term));
  return spots.map((spot,index)=>{
    let score=asksNearest?-Number.parseFloat(spot.distance)*100:Number(averageRating(spot));
    if(asksQuiet)score+=Number(spot.r.find(([label])=>label==="Quiet")[1])*2;
    if(asksWifi)score+=Number(spot.r.find(([label])=>label==="Wifi")[1])*2;
    if(asksBudget){score+=Number(spot.r.find(([label])=>label==="Price")[1]);score+=(3-spot.priceRange.length)*2}
    if(asksCharging)score+=spot.charging?10:-10;
    if(asksOpen)score+=spot.openNow?10:-10;
    return{spot,index,score};
  }).sort((left,right)=>right.score-left.score);
}
function addBrewySuggestion(match){
  const suggestion=document.createElement("button");suggestion.type="button";suggestion.className="brewy-suggestion";
  const icon=document.createElement("span");icon.className="msr";icon.setAttribute("aria-hidden","true");icon.textContent="local_cafe";
  const label=document.createElement("span");label.textContent=match.spot.n;
  const arrow=document.createElement("span");arrow.className="msr";arrow.setAttribute("aria-hidden","true");arrow.textContent="arrow_forward";
  suggestion.append(icon,label,arrow);suggestion.addEventListener("click",()=>{
    pick(match.index);brewyChat.hidden=true;brewyToggle.setAttribute("aria-expanded","false");
  });
  brewyMessages.appendChild(suggestion);
}
function answerBrewy(query){
  brewyMessages.querySelectorAll(".brewy-suggestion").forEach(suggestion=>suggestion.remove());
  appendBrewyMessage(query,"user");
  const normalized=query.toLowerCase(),matches=getBrewyMatches(query).slice(0,3),best=matches[0];
  let answer=best.spot.n+" is a strong demo match at "+best.spot.distance+" from CIT-U.";
  if(["nearest","closest","nearby","near"].some(term=>normalized.includes(term)))answer="The nearest demo cafe to CIT-U is "+best.spot.n+" ("+best.spot.distance+", "+best.spot.travelTime+"). Here are the nearby options:";
  else if(["quiet","calm","focus","peaceful"].some(term=>normalized.includes(term)))answer=best.spot.n+" looks like a good quiet match with a "+best.spot.r.find(([label])=>label==="Quiet")[1]+"/5 quiet rating.";
  else if(["wifi","wi-fi","internet","online"].some(term=>normalized.includes(term)))answer=best.spot.n+" is the top Wi-Fi-rated demo match at "+best.spot.distance+" from CIT-U.";
  else if(["budget","cheap","affordable","price"].some(term=>normalized.includes(term)))answer=best.spot.n+" is the best-rated budget demo match at "+best.spot.distance+" from CIT-U.";
  else if(["charging","power","outlet","plug"].some(term=>normalized.includes(term)))answer=best.spot.n+(best.spot.charging?" has sample charging availability":" has no sample charging ports");
  else if(["open","now"].some(term=>normalized.includes(term)))answer=best.spot.n+(best.spot.openNow?" is marked open in this demo":" is marked closed in this demo");
  appendBrewyMessage(answer+" Cafe details are illustrative demo data.","bot");
  matches.forEach(addBrewySuggestion);
}
// Brewy assistant behavior
brewyToggle.addEventListener("click",()=>{
  const opening=brewyChat.hidden;brewyChat.hidden=!opening;brewyToggle.setAttribute("aria-expanded",String(opening));
  if(opening){
    ["left","right","top","bottom"].forEach(property=>brewyChat.style.removeProperty(property));
    brewyChat.classList.remove("dragging");
    brewyPrompt.focus();
  }
});
brewyClose.addEventListener("click",()=>{brewyChat.hidden=true;brewyToggle.setAttribute("aria-expanded","false");brewyToggle.focus()});
brewyChat.addEventListener("click",event=>{
  const choice=event.target.closest(".brewy-prompt-choice");
  if(choice)answerBrewy(choice.textContent.trim());
});
brewyForm.addEventListener("submit",event=>{
  event.preventDefault();
  const query=brewyPrompt.value.trim();if(!query)return;
  answerBrewy(query);brewyPrompt.value="";
});
function placeBrewyChat(left,top){
  const maxLeft=Math.max(0,explorer.clientWidth-brewyChat.offsetWidth),maxTop=Math.max(0,explorer.clientHeight-brewyChat.offsetHeight);
  brewyChat.style.left=Math.max(0,Math.min(left,maxLeft))+"px";brewyChat.style.top=Math.max(0,Math.min(top,maxTop))+"px";
  brewyChat.style.right="auto";brewyChat.style.bottom="auto";
}
brewyDragHandle.addEventListener("pointerdown",event=>{
  if(event.target.closest("button")||(event.pointerType==="mouse"&&event.button!==0))return;
  event.preventDefault();
  const explorerRect=explorer.getBoundingClientRect(),chatRect=brewyChat.getBoundingClientRect();
  const left=chatRect.left-explorerRect.left,top=chatRect.top-explorerRect.top;
  placeBrewyChat(left,top);brewyDrag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,left,top};
  brewyDragHandle.setPointerCapture(event.pointerId);brewyChat.classList.add("dragging");
});
brewyDragHandle.addEventListener("pointermove",event=>{
  if(!brewyDrag||brewyDrag.pointerId!==event.pointerId)return;
  placeBrewyChat(brewyDrag.left+event.clientX-brewyDrag.startX,brewyDrag.top+event.clientY-brewyDrag.startY);
});
function endBrewyDrag(event){
  if(!brewyDrag||brewyDrag.pointerId!==event.pointerId)return;
  brewyDrag=null;brewyChat.classList.remove("dragging");
  if(brewyDragHandle.hasPointerCapture(event.pointerId))brewyDragHandle.releasePointerCapture(event.pointerId);
}
brewyDragHandle.addEventListener("pointerup",endBrewyDrag);
brewyDragHandle.addEventListener("pointercancel",endBrewyDrag);
brewyDragHandle.addEventListener("keydown",event=>{
  if(event.target!==brewyDragHandle||brewyChat.hidden)return;
  const step=event.shiftKey?32:12;
  const movement={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];
  if(!movement)return;
  event.preventDefault();
  const explorerRect=explorer.getBoundingClientRect(),chatRect=brewyChat.getBoundingClientRect();
  const left=brewyChat.style.left?Number.parseFloat(brewyChat.style.left):chatRect.left-explorerRect.left;
  const top=brewyChat.style.top?Number.parseFloat(brewyChat.style.top):chatRect.top-explorerRect.top;
  placeBrewyChat(left+movement[0],top+movement[1]);
});

// Waitlist flow
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
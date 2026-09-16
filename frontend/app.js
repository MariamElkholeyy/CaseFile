const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token=localStorage.getItem('casefile-token'),state={},docs=[],view='desk',current=null,chat=null,chats=[];
async function api(path,method='GET',data){const r=await fetch(path,{method,headers:{'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})});let body=await r.json();if(!r.ok)throw Error(typeof body.detail==='string'?body.detail:'Please check your input and try again.');return body;}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3500)}
async function start(){try{if(!token){let s=await api('/sessions','POST');token=s.token;localStorage.setItem('casefile-token',token);state=s.state}else{try{state=await api('/progress')}catch(e){token=null;localStorage.removeItem('casefile-token');return start()}}docs=await api('/documents');render();if(!localStorage.getItem('casefile-intro-v2'))showIntro();let h=await api('/health');$('#connection').textContent=h.generation_ready&&h.retrieval_ready?(h.provider==='groq'?'● Groq research online':'● Local research online'):h.retrieval_ready?'◌ Evidence search ready':'◌ Index being prepared';}catch(e){$('#main').innerHTML='<div class="loading"><h2>Workspace unavailable</h2><p>'+esc(e.message)+'</p><button class="secondary" onclick="location.reload()">Try again</button></div>';}}
const scarab=`<div class="sculpture"><div class="sculpture-fallback">𓆣</div></div>`;
// Escape first; model output never becomes arbitrary HTML or executable links.
function formatAnswer(value){
 const inline=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/__([^_]+)__/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\[([A-Z0-9]+-\d+)\]/g,'<button class="citation-pill" data-chunk="$1" title="Inspect source $1">◈ $1</button>');
 let out='',list='';const close=()=>{if(list){out+='</'+list+'>';list=''}};
 for(const line of String(value).split('\n')){const item=line.match(/^\s*(?:([-*])|\d+[.)])\s+(.+)$/);if(item){const type=item[1]?'ul':'ol';if(list!==type){close();list=type;out+='<'+type+'>'}out+='<li>'+inline(item[2])+'</li>'}else{close();if(line.trim())out+=/^#{1,6}\s/.test(line)?'<h4>'+inline(line.replace(/^#{1,6}\s+/,''))+'</h4>':'<p>'+inline(line)+'</p>';}}close();return out;
}
const steps=[
 {title:'Identify the objects',hint:'Start with the inspection notes. Look for holes, markings and separate pieces. Then use the real reference to interpret those details.',file:'E02',read:'Read the inspection notes',question:'How do heart scarabs differ from funerary scarabs?',look:'Compare the reference with trays P and Q. Pin the documents that support your interpretation.'},
 {title:'Trace the handover',hint:'Follow a seal number from packing to receiving. Compare the recorded destination with what the receiving staff actually observed.',file:'E04',read:'Open the packing record',question:'Where did seal 731 arrive according to the receiving records?',look:'Check E05 and E06 against the packing record. Record any mismatch in your notebook.'},
 {title:'Write a working theory',hint:'Describe what you think happened and which records support it. Your first theory does not have to be correct.',file:'E08',read:'Inspect the revised register',question:'How does the revised location register compare with the receiving observations?',look:'Save your explanation in the notebook to unlock two follow-up documents.'},
 {title:'Check before you conclude',hint:'Read the new statements and physical check. Decide whether they support your explanation or change it.',file:'E09',read:'Read the staff statements',question:'What do the follow-up records establish, and what remains uncertain?',look:'Use E09 and E10, then submit your findings with at least two supporting references.'}
];
function guideIndex(){let n=Number(localStorage.getItem('casefile-guide-'+token)||0);return Math.max(0,Math.min(Number.isFinite(n)?n:0,state.stage===1?2:3))}
function guide(){const n=guideIndex(),g=steps[n];return `<section class="case-guide" aria-label="Investigation guide"><div class="guide-body"><div class="guide-heading"><span class="eyebrow">CURRENT LEAD · ${n+1} OF 4</span><details class="lead-menu"><summary>All leads</summary><div class="guide-progress">${steps.map((x,i)=>`<button data-step="${i}" ${i===3&&state.stage===1?'disabled':''} aria-current="${i===n?'step':'false'}"><span>${i+1}</span>${x.title}${i===3&&state.stage===1?' · Locked':''}</button>`).join('')}</div></details></div><h2>${g.title}</h2><p>${g.hint}</p><div class="guide-actions"><button class="primary" data-doc="${g.file}">1. ${g.read} ↗</button><button class="secondary" data-question="${g.question}">2. Explore with your assistant ↓</button></div><details class="lead-help"><summary>What should I look for?</summary><p>${g.look}</p><p class="suggested-query">Suggested question: “${g.question}”</p></details><div class="guide-bottom"><button class="text-btn" data-go="notebook">${n===2?'Write my initial theory':'Save a thought in my notebook'} ↗</button>${n<2||n===2&&state.stage===2?`<button class="text-btn" data-step="${n+1}">Next lead →</button>`:n===3?'<button class="text-btn" data-go="report">Prepare my findings →</button>':''}</div></div></section>`}

function bindGuide(){document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{localStorage.setItem('casefile-guide-'+token,b.dataset.step);render();$('#research')?.scrollIntoView({behavior:'smooth'})})}

function card(d){return `<button class="evidence-card" data-doc="${d.id}"><span class="mini-label">${d.id} · ${d.kind==='Authentic reference'?'AUTHENTIC REFERENCE':'CASE EVIDENCE'}</span><h3>${esc(d.title)}</h3><span class="foot"><span>${state.pins.includes(d.id)?'◆ Pinned':'Read document'}</span><span>↗</span></span></button>`}
function assistant(){return `<div class="card assistant"><div class="assistant-top"><span class="spark">✧</span><div>Research channel<span class="channel-sub">CONNECTED TO YOUR UNLOCKED CASE FILES</span></div><span class="live-dot"></span></div><div class="assistant-welcome"><img class="research-mascot" src="assets/duck-guide.png" alt="Egyptian duck research guide" width="1254" height="1254" loading="lazy"><div class="signal-mark">✧</div><span class="eyebrow">EVERY ANSWER LEADS BACK TO EVIDENCE</span><h3>Your research partner</h3><p>Ask about your current lead. Open a source beneath the answer to check it, then pin useful evidence.</p><details class="mascot-help"><summary>New here? Let’s follow a clue.</summary><ol><li>Open the document in your current lead above.</li><li>Choose “Explore with your assistant” to start a question.</li><li>Check the cited source, then save your thoughts in My notebook.</li></ol><p>Your guide explains the tools. The documents hold the answers.</p></details></div><div id="answer">${chats.length?chats.map(chatHTML).join(''):'<div class="starter-label">YOUR FIRST LINES OF INQUIRY</div>'}</div><form class="chat-form" id="ask"><label class="visually-hidden" for="question">Ask about the evidence</label><input id="question" placeholder="Ask a question about this case…" required minlength="3" maxlength="1500"><button aria-label="Send question">↑</button></form><div class="composer-note">Sources attached to responses · Click any citation badge to inspect exact passage</div></div>`}
function chatHTML(c){return `<div class="question-bubble"><span>YOU</span>${esc(c.question)}</div><div class="chat-label">CASEFILE / ${c.mode==='evidence_only'?'EVIDENCE SEARCH':'RESEARCH RESPONSE'}</div><div class="chat-answer">${formatAnswer(c.answer)}</div><div class="chat-label">OPEN A SOURCE TO CHECK THE EVIDENCE</div><div class="response-sources">${(c.evidence||[]).map(h=>`<button class="source-button" data-chunk="${h.chunk_id}"><b>${esc(h.chunk_id)}</b><span>${esc(h.title)}</span><small>${esc(h.text.slice(0,125))}…</small></button>`).join('')}</div>`}
const fileDescriptions={E01:'Understand your assignment and the limits of the case.',E02:'Compare the physical features of the three trays.',E03:'Find out which object was requested at each destination.',E04:'Match each tray to its numbered seal.',E05:'Follow the original dispatch destinations.',E06:'Check what staff actually received and where it was placed.',E07:'Read the clarification exchange after the discrepancy.',E08:'Inspect the later changes to the location register.',E09:'Compare the follow-up testimony with the records.',E10:'Verify the objects’ latest physical locations.'};
function libraryRow(d){return `<button class="file-row" data-doc="${d.id}"><span class="file-number">${d.id}</span><span class="file-copy"><strong>${esc(d.title)}</strong><small>${fileDescriptions[d.id]||'Read this source.'}</small></span><span class="file-state">${state.pins.includes(d.id)?'◆ Pinned':'Read ↗'}</span></button>`}
function libraryContent(){const q=($('#search')?.value||'').toLowerCase(),f=$('#filter')?.value||'all';const selected=docs.filter(d=>(d.title+' '+d.id+' '+(fileDescriptions[d.id]||'')).toLowerCase().includes(q));let html='';if(f!=='Authentic reference'){for(const [label,ids] of [['01 / Understand the objects',['E01','E02','E03']],['02 / Follow the paper trail',['E04','E05','E06','E07','E08']],['03 / Verify your theory',['E09','E10']]]){const rows=selected.filter(d=>ids.includes(d.id));if(rows.length)html+=`<section class="file-group"><h2>${label}</h2>${rows.map(libraryRow).join('')}</section>`;}if(state.stage===1&&!q)html+='<div class="sealed-files"><span>03 / Follow-up evidence is sealed</span><p>Record an initial theory to unlock the staff statements and final physical check.</p><button class="secondary" data-go="notebook">Write my theory →</button></div>';}
const refs=selected.filter(d=>d.kind==='Authentic reference');if(f!=='Fictional evidence'&&refs.length)html+=`<section class="reference-collection"><div class="reference-heading"><span class="eyebrow">AUTHENTIC REFERENCE / ONE PUBLICATION</span><h2>The history behind the clues.</h2><p>These two extracts come from the same published catalogue. Use them to interpret the fictional observations.</p></div><div class="publication"><div class="book-object" aria-hidden="true"><div class="book-cover"><span>MEDINET HABU</span><b>Scarabs &<br>Seal Impressions</b><i>REFERENCE VOLUME</i></div></div><div class="publication-info"><span class="eyebrow">UNIVERSITY OF CHICAGO · 2003</span><h3>Scarabs, Scaraboids, Seals, and Seal Impressions from Medinet Habu</h3><p>Emily Teeter, with T. G. Wilfong</p><a class="primary" href="${esc(refs[0].source_url)}#page=146" target="_blank" rel="noopener noreferrer">Open original PDF ↗</a><small class="pdf-note">Publisher-hosted full publication · opens in a new tab.<br>Printed pp. 122–123 are PDF pages 146–147. If your viewer ignores the page link, enter 146 manually.</small><div class="extract-links">${refs.map(d=>`<button class="secondary" data-doc="${d.id}">Read extract · p. ${d.page} ${state.pins.includes(d.id)?'◆':''}</button>`).join('')}</div><p class="reference-limit">Authentic publication, fictional incident. This reference does not authenticate the case objects.</p></div></div></section>`;return html||'<div class="notice">No matching files. Try a tray, document title or file ID.</div>'}
function updateLibrary(){const el=$('#library');if(el){el.innerHTML=libraryContent();bindDocs();el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go))}}

function duckTip(message,thinking=false){return `<aside class="duck-tip"><img src="assets/${thinking?'duck-thinking.png':'duck-guide.png'}" alt="" width="78" height="90" loading="lazy"><div><span class="eyebrow">A LITTLE HELP FROM YOUR GUIDE</span><p>${message}</p></div></aside>`}
function render(){document.body.classList.toggle('arrival-screen',view==='desk'&&localStorage.getItem('casefile-focus-'+token)!=='yes');document.body.classList.toggle('investigation-focus',view==='desk'&&localStorage.getItem('casefile-focus-'+token)==='yes');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#doc-count').textContent=docs.length;const main=$('#main');if(view==='desk'){main.innerHTML=`<section class="arrival"><div class="arrival-copy"><span class="eyebrow">CAIRO · LANTERN MUSEUM · CASE 001</span><h1>The Swapped<br><em>Scarab.</em></h1><p>Three trays. One conflicting record.<br>Every object has a story. Find the truth in this one.</p><button class="primary" id="enter-research">Begin investigating ↓</button><button class="text-btn" id="replay-intro">Watch the briefing ↗</button></div><div class="arrival-object">${scarab}<span class="object-caption">DRAG TO ROTATE · ILLUSTRATIVE SCULPTURE</span></div></section><section class="research-main" id="research"><div class="topline"><span class="eyebrow">${state.stage===1?'ACT I / FOLLOW THE EVIDENCE':'ACT II / CHECK YOUR THEORY'}</span><div class="desk-tools"><button class="text-btn" data-doc="E01">Case briefing ↗</button><button class="text-btn" id="show-arrival">Return to opening</button></div></div>${guide()}${assistant()}</section><section class="people"><span class="eyebrow">THE PEOPLE BEHIND THE PAPERWORK</span><h2>Four people. One handover.</h2><p>Meet the fictional museum team. Their appearance tells you nothing about responsibility—follow their records.</p><div class="people-grid">${[['Mariam Nabil','Curator','Oversees the collection.'],['Nadia Hassan','Exhibition coordinator','Coordinates the handover.'],['Omar Adel','Receiving technician','Receives the sealed trays.'],['Leila Farid','Exhibition assistant','Helps prepare the exhibition.']].map((c,i)=>`<article><div class="portrait" role="img" aria-label="Illustrated fictional character ${c[0]}" style="background-position:${i*100/3}% 22%"></div><h3>${c[0]}</h3><span class="eyebrow">${c[1]}</span><p>${c[2]}</p></article>`).join('')}</div><small>AI-generated fictional portraits · Not evidence photographs</small></section>`}

if(view==='evidence'){main.innerHTML=`<section class="library-header"><div><span class="eyebrow">LANTERN MUSEUM / INVESTIGATION ARCHIVE</span><h1 class="page-title">The case files.</h1><p class="page-desc">Follow the records in order, or open the original scholarship.</p></div><button class="secondary" data-go="desk">Back to investigation →</button></section>${duckTip("Start with E02 to inspect the objects. Open the original publication when you need historical context.")}<div class="library-controls"><div class="toolbar"><input id="search" aria-label="Search case files" placeholder="Search files or IDs…"><select id="filter" aria-label="Filter document type"><option value="all">All sources</option><option>Fictional evidence</option><option>Authentic reference</option></select></div><span class="library-key">${docs.filter(d=>d.kind==='Fictional evidence').length} case records · 1 authentic publication</span></div><div id="library" class="library-shelf"></div>`}

function connectionsHTML(){
 const cons = state.connections || [];
 const docOptions = docs.map(d=>`<option value="${d.id}">${d.id} · ${esc(d.title)}</option>`).join('');
 return `<div class="connections-section">
   <div class="connections-head">
     <h3>Evidence Relationships</h3>
     <span class="eyebrow">${cons.length} CONNECTED CLAIMS</span>
   </div>
   <div class="connections-builder">
     <select id="conn-src" aria-label="Source Document">${docOptions}</select>
     <select id="conn-type" aria-label="Relationship Type">
       <option value="supports">🟢 Supports</option>
       <option value="contradicts">🔴 Contradicts</option>
       <option value="explains">🟡 Explains</option>
       <option value="questions">🔵 Questions</option>
     </select>
     <select id="conn-target" aria-label="Target Document">${docOptions}</select>
     <button id="add-conn" type="button">+ Link Evidence</button>
   </div>
   <div class="connections-list">
     ${cons.map((c,i)=>`<div class="connection-item">
       <div class="connection-link">
         <button class="text-btn" data-doc="${c.source}"><b>${c.source}</b></button>
         <span class="rel-badge rel-${c.type}">${c.type}</span>
         <button class="text-btn" data-doc="${c.target}"><b>${c.target}</b></button>
       </div>
       <button class="connection-del" data-del-conn="${i}" title="Remove link">✕</button>
     </div>`).join('') || '<p class="muted" style="margin:4px 0;font-size:12px">No links added yet. Connect documents above to map out your theory.</p>'}
   </div>
 </div>`;
}

function timelineHTML(){
 return `<div class="dual-timeline">
   <div class="timeline-track register-track">
     <div class="track-header">
       <h4>📋 Official Register Claims</h4>
       <small>WHAT THE SYSTEM RECORDS</small>
     </div>
     <div class="track-events">
       <div class="timeline-node">
         <time>10:00</time>
         <div class="node-content">
           <strong>Exhibition Request [E03]</strong>
           <p>Curator specifies LM-101 for Gallery D-1 and COPY-03 for Education E-C4.</p>
         </div>
       </div>
       <div class="timeline-node">
         <time>12:05</time>
         <div class="node-content">
           <strong>Packing Register [E04]</strong>
           <p>Seal 731 assigned to Tray P, Seal 732 to Tray Q, Seal 733 to Tray R.</p>
         </div>
       </div>
       <div class="timeline-node alert-node">
         <time>14:26</time>
         <div class="node-content">
           <strong>Central Register Modified [E08]</strong>
           <p>Nadia falsely edits system log to show all items at planned destinations.</p>
           <span class="conflict-badge">⚠️ RECORD FALSIFICATION</span>
         </div>
       </div>
     </div>
   </div>
   <div class="timeline-track observation-track">
     <div class="track-header">
       <h4>🔍 Field Observations</h4>
       <small>WHAT STAFF PHYSICALLY WITNESSED</small>
     </div>
     <div class="track-events">
       <div class="timeline-node">
         <time>09:10</time>
         <div class="node-content">
           <strong>Morning Inspection [E02]</strong>
           <p>Tray P: unpierced heart scarab. Tray Q: funerary set. Tray R: resin replica.</p>
         </div>
       </div>
       <div class="timeline-node mismatch-node">
         <time>13:20</time>
         <div class="node-content">
           <strong>Physical Receiving Logs [E06]</strong>
           <p>Seal 731 delivered to Education Cabinet E-C4. Seal 732 to D-1.</p>
           <span class="mismatch-badge">⚡ MISDELIVERY OCCURRED</span>
         </div>
       </div>
       <div class="timeline-node">
         <time>14:05</time>
         <div class="node-content">
           <strong>Discrepancy Flagged [E01, E07]</strong>
           <p>Curator Mariam discovers mismatched object in Display D-1.</p>
         </div>
       </div>
       <div class="timeline-node verified-node">
         <time>15 Oct 09:15</time>
         <div class="node-content">
           <strong>Physical Recheck [E10]</strong>
           <p>LM-101 confirmed resting inside Cabinet E-C4. All artifacts accounted for.</p>
           <span class="verified-badge">✓ ACCOUNTED FOR</span>
         </div>
       </div>
     </div>
   </div>
 </div>`;
}

if(view==='notebook'){main.innerHTML=`<span class="eyebrow">YOUR WORKING THEORY</span><h1 class="page-title">Connect the dots.</h1><p class="page-desc">Keep observations separate from assumptions. Connect related evidence and save your deductions.</p>${duckTip("What did you observe? What do you think it means? Keep those separate while you build your theory.",true)}<div class="columns"><section><div class="card"><div class="notebook-tripartite"><div class="thinking-tier"><div class="tier-header"><h3><span>1</span> What I Observed</h3><small>PHYSICAL EVIDENCE & TIMESTAMPS</small></div><textarea id="notes-observed" placeholder="Record concrete facts: scarab dimensions, absence of attachment holes, seal numbers, timestamps...">${esc(state.notes_observed||'')}</textarea></div><div class="thinking-tier"><div class="tier-header"><h3><span>2</span> My Working Theory</h3><small>INTERPRETATIONS TO TEST</small></div><textarea id="notes-interpretation" placeholder="Interpret what happened: why the tray moved, who made the handover, whether the record was revised honestly...">${esc(state.notes_interpretation||'')}</textarea></div><div class="thinking-tier"><div class="tier-header"><h3><span>3</span> What I Still Need to Verify</h3><small>GAPS & CONTRADICTIONS</small></div><textarea id="notes-verification" placeholder="Note down open questions to explore with the assistant or verify in follow-up records...">${esc(state.notes_verification||'')}</textarea></div></div><button id="save-notes" class="primary dark" style="margin-top:16px">Save notes ↗</button></div><div class="recent"><div class="section-head"><h2>Pinned evidence</h2><span>${state.pins.length} FILES</span></div><div class="evidence-grid">${docs.filter(d=>state.pins.includes(d.id)).map(card).join('')||'<p class="muted">Open a document and pin it here.</p>'}</div></div>${connectionsHTML()}</section><section class="card"><h2>Follow up & Timeline.</h2>${state.stage===1?`<p class="page-desc">Describe your initial explanation to request the staff statements and final physical inspection. You don’t need to be right yet.</p><label for="initial">Initial theory · at least 40 characters</label><textarea id="initial" minlength="40" placeholder="I think… because the records show…"></textarea><button id="unlock" class="primary dark">Request follow-up evidence ↗</button>`:'<div class="notice">Follow-up evidence is available: E09 and E10. Revisit your theory after reading both.</div><button class="secondary" data-go="report">Prepare final report ↗</button>'}${timelineHTML()}</section></div>`}
if(view==='report'){main.innerHTML=`<span class="eyebrow">MAKE YOUR CASE</span><h1 class="page-title">What does the evidence say?</h1><p class="page-desc">Submit your findings with historical and case references. Structured answers are checked against the case rubric; your written reasoning is saved for human review.</p>${duckTip("Before submitting, recheck the follow-up evidence and choose the sources that support your conclusion.")} ${state.stage<2?'<div class="notice">First record an initial theory in your notebook to unlock the follow-up evidence.</div><button class="primary dark" data-go="notebook">Open notebook ↗</button>':`<form id="report" class="card"><div class="report-grid">${select('heart_tray','Which tray matches the heart scarab?',{'':'Choose a tray',P:'Tray P',Q:'Tray Q',R:'Tray R'})}${select('funerary_tray','Which tray matches the funerary assemblage?',{'':'Choose a tray',P:'Tray P',Q:'Tray Q',R:'Tray R'})}${select('destination','Latest verified location of LM-101?',{'':'Choose a location','D-1':'Central display D-1','E-C4':'Education cabinet E-C4','S-C2':'Study cabinet S-C2',unknown:'Not established'})}${select('responsibility','What does the record establish?',{'':'Choose a finding',mistake_only:'A dispatch mistake only',mistake_and_false_update:'A mistake followed by a knowing false update',theft:'A proven theft'})}${select('outcome','What is supported at the final check?',{'':'Choose a conclusion',accounted_for:'All groups accounted for; no theft established',missing:'The original remains missing',authenticated:'Scientific authenticity established'})}</div><label for="conclusion">Your explanation · at least 40 characters</label><textarea id="conclusion" name="conclusion" minlength="40" maxlength="6000" required></textarea><label>Supporting references · select at least two</label><div class="checks">${docs.map(d=>`<label><input type="checkbox" name="citations" value="${d.id}">${d.id}</label>`).join('')}</div><button class="primary dark" style="margin-top:20px">Submit investigation ↗</button></form><div id="result">${state.submission?resultHTML(state.submission.result):''}</div>`}`}
bind();bindGuide();if($('#enter-research'))$('#enter-research').onclick=()=>{localStorage.setItem('casefile-focus-'+token,'yes');render();window.scrollTo(0,0)};if($('#show-arrival'))$('#show-arrival').onclick=()=>{localStorage.removeItem('casefile-focus-'+token);render();window.scrollTo(0,0)};if($('#replay-intro'))$('#replay-intro').onclick=()=>showIntro();}
function select(name,label,options){return `<div><label for="${name}">${label}</label><select id="${name}" name="${name}" required>${Object.entries(options).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`}
function resultHTML(r){return `<div class="card recent"><span class="eyebrow">STRUCTURED FINDINGS REVIEW</span><p class="score">${r.score}<small style="font-size:22px"> / ${r.total}</small></p>${r.checks.map(c=>`<p>${c.passed?'✓':'○'} ${esc(c.label)}</p>`).join('')}<p class="page-desc">${esc(r.note)}</p></div>`}

function openDrawer(chunkId){
 const drawer=$('#drawer');if(!drawer)return;
 let chunk=null;
 for(const c of [...chats].reverse()){if(c.evidence){chunk=c.evidence.find(h=>h.chunk_id===chunkId);if(chunk)break;}}
 const docId=chunkId.split('-')[0];
 const doc=docs.find(d=>d.id===docId)||(chunk?{id:docId,title:chunk.title,kind:chunk.kind,text:chunk.text,source_url:chunk.source_url,page:chunk.page}:null);
 if(!doc&&!chunk)return openDoc(docId);
 const title=chunk?.title||doc?.title||docId;
 const kind=chunk?.kind||doc?.kind||'Evidence';
 const text=chunk?.text||doc?.text||'';
 $('#drawer-title').textContent=title;
 $('#drawer-chunk-id').textContent=chunkId;
 $('#drawer-kind').textContent=kind.toUpperCase();
 $('#drawer-text').textContent=text;
 $('#drawer-tip').textContent=fileDescriptions[docId]||'Verify how this passage supports or contradicts your theory.';
 $('#drawer-pin').textContent=state.pins.includes(docId)?'Unpin from notebook':'Pin to notebook';
 $('#drawer-pin').onclick=async()=>{
  try{if(state.pins.includes(docId))state.pins=state.pins.filter(x=>x!==docId);else state.pins.push(docId);await save();$('#drawer-pin').textContent=state.pins.includes(docId)?'Unpin from notebook':'Pin to notebook';render();toast('Notebook updated.');}catch(e){toast(e.message)}
 };
 $('#drawer-full').onclick=()=>{closeDrawer();openDoc(docId)};
 $('#drawer-source').hidden=!doc?.source_url;
 $('#drawer-source').href=doc?.source_url?doc.source_url+'#page='+(doc.page+24):'#';
 drawer.inert=false;drawer.classList.add('open');document.body.classList.add('inspecting-source');$('#drawer-close').focus();
 drawer.setAttribute('aria-hidden','false');
}
function closeDrawer(){const d=$('#drawer');if(d){d.classList.remove('open');d.inert=true;document.body.classList.remove('inspecting-source');$('#question')?.focus();d.setAttribute('aria-hidden','true')}}

function openDoc(id){current=docs.find(d=>d.id===id);if(!current)return;$('#reader-tag').textContent=current.id+' · '+current.kind.toUpperCase();$('#reader-title').textContent=current.title;$('#reader-body').textContent=current.text;let tip=$('#reader-tip');if(!tip){tip=document.createElement('p');tip.id='reader-tip';$('#reader-body').before(tip)}tip.textContent=({E01:'Your task: establish what moved, where it went and what the records prove.',E02:'Look for: attachment holes, markings, dimensions and the pieces accompanying each tray.',E03:'Look for: the requested object type for each destination. Compare these with the archaeological reference.',E04:'Look for: the seal assigned to each tray. Use it to follow that tray through later records.',E05:'Look for: the original destination recorded for each seal.',E06:'Look for: observed contents and actual receiving locations. Compare with E04 and E05.',E08:'Look for: what changed in the location register, and whether other records support that change.',E09:'Look for: what each statement establishes. Compare it with the earlier records.',E10:'Look for: the final observed location of each object group.'})[id]||'Look for a passage that supports your current question. Pin this document if it helps your theory.';$('#reader-pin').textContent=state.pins.includes(id)?'Unpin from notebook':'Pin to notebook';$('#reader-source').hidden=!current.source_url;$('#reader-source').href=current.source_url?current.source_url+'#page='+(current.page+24):'#';$('#reader-source').textContent='Open original PDF · page '+(current.page+24)+' ↗';$('#reader').showModal()}
async function save(){state=await api('/progress','PUT',{notes:state.notes,notes_observed:state.notes_observed,notes_interpretation:state.notes_interpretation,notes_verification:state.notes_verification,pins:state.pins,connections:state.connections||[]})}
async function ask(q){if(!q||q.trim().length<3||$('#ask button')?.disabled)return;document.querySelector('.assistant')?.scrollIntoView({behavior:'smooth',block:'start'});const el=$('#answer');el.innerHTML=chats.map(chatHTML).join('')+'<p class="muted" role="status" id="answer-wait">Searching the evidence and preparing a response…</p>';const began=Date.now(),waiting=setInterval(()=>{const status=$('#answer-wait');if(status)status.textContent='Preparing your response · '+Math.floor((Date.now()-began)/1000)+' seconds. The local model may take a little time.'},1000);$('#ask button').disabled=true;try{const a=await api('/query','POST',{question:q});chat={question:q,...a};chats.push(chat);if(chats.length>10)chats.shift();el.innerHTML=chats.map(chatHTML).join('');el.querySelectorAll('.question-bubble')[chats.length-1]?.scrollIntoView({behavior:'smooth',block:'nearest'});document.querySelector('.assistant-welcome')?.classList.add('condensed');bindDocs();}catch(e){el.innerHTML='<p class="error">'+esc(e.message)+'</p>'}finally{clearInterval(waiting);if($('#ask button'))$('#ask button').disabled=false}}
function bindDocs(){
 document.querySelectorAll('[data-doc]').forEach(b=>b.onclick=()=>openDoc(b.dataset.doc));
 document.querySelectorAll('[data-chunk]').forEach(b=>b.onclick=()=>openDrawer(b.dataset.chunk));
}
function bind(){bindDocs();document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{$('#question').value=b.dataset.question;ask(b.dataset.question)});if($('#ask'))$('#ask').onsubmit=e=>{e.preventDefault();ask($('#question').value)};if($('#search')){$('#search').oninput=updateLibrary;$('#filter').onchange=updateLibrary;updateLibrary()}
if($('#save-notes'))$('#save-notes').onclick=async()=>{
 try{
  state.notes_observed=$('#notes-observed')?.value||'';
  state.notes_interpretation=$('#notes-interpretation')?.value||'';
  state.notes_verification=$('#notes-verification')?.value||'';
  state.notes=`OBSERVED:\n${state.notes_observed}\n\nTHEORY:\n${state.notes_interpretation}\n\nVERIFY:\n${state.notes_verification}`;
  await save();toast('Notebook saved.')
 }catch(e){toast(e.message)}
};
if($('#add-conn'))$('#add-conn').onclick=async()=>{
 const s=$('#conn-src')?.value,t=$('#conn-target')?.value,type=$('#conn-type')?.value;
 if(!s||!t)return;
 state.connections=state.connections||[];
 if(s===t){toast('Select two different documents to connect.');return;}
 state.connections.push({source:s,target:t,type});
 try{await save();render();toast('Evidence connected.');}catch(e){toast(e.message)}
};
document.querySelectorAll('[data-del-conn]').forEach(b=>b.onclick=async()=>{
 const idx=Number(b.dataset.delConn);
 if(state.connections&&state.connections[idx]!==undefined){
  state.connections.splice(idx,1);
  try{await save();render();toast('Link removed.');}catch(e){toast(e.message)}
 }
});
if($('#unlock'))$('#unlock').onclick=async()=>{try{state=await api('/unlock','POST',{theory:$('#initial').value});docs=await api('/documents');localStorage.setItem('casefile-guide-'+token,'3');render();toast('Follow-up evidence unlocked.')}catch(e){toast(e.message)}};if($('#report'))$('#report').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),data=Object.fromEntries(f);data.citations=f.getAll('citations');try{const result=await api('/submit','POST',data);state.submission={result};$('#result').innerHTML=resultHTML(result);$('#result').scrollIntoView({behavior:'smooth'})}catch(e){toast(e.message)}}}
function animateSection(el){if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches||!el.animate)return;el.getAnimations().forEach(a=>a.cancel());el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});}
function go(v){closeDrawer();if(v==='desk')localStorage.setItem('casefile-focus-'+token,'yes');view=v;render();animateSection($('#main'));if(v==='desk')$('#research')?.scrollIntoView();else window.scrollTo(0,0)}document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.view));$('#reader-close').onclick=()=>$('#reader').close();$('#drawer-close').onclick=closeDrawer;$('#reader').addEventListener('click',e=>{if(e.target===$('#reader')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});$('#reader-pin').onclick=async()=>{try{if(state.pins.includes(current.id))state.pins=state.pins.filter(x=>x!==current.id);else state.pins.push(current.id);await save();$('#reader-pin').textContent=state.pins.includes(current.id)?'Unpin from notebook':'Pin to notebook';render();toast('Notebook updated.')}catch(e){toast(e.message)}};$('#restart').onclick=()=>{if(confirm('Start a new investigation? The previous session will remain stored, but this browser will switch to a fresh notebook.')){localStorage.removeItem('casefile-token');token=null;chat=null;chats=[];view='desk';start()}};$('#main').innerHTML='<div class="loading">Opening the case file…</div>';start();

let introStep=0;
const teachingScenes=[
 {tag:'CASEFILE / A FICTIONAL INVESTIGATION',title:'Something is<br>out of place.',body:'Cairo. A museum exhibition opens tomorrow. During the final inspection, a curator notices that the scarab in the display does not match its earlier record.',detail:'Three sealed trays. Conflicting destinations. One trail of evidence.',action:'Accept the case'},
 {tag:'01 / YOUR ROLE',title:'You are the<br>investigator.',body:'Your job is to establish what moved, where it went, and what the records can actually prove. You don’t need to know Egyptology before you begin.',detail:'The events and people are fictional. The archaeological reference is real.',action:'Meet your research partner'},
 {tag:'02 / HOW TO INVESTIGATE',title:'Ask. Read.<br>Connect.',body:'The assistant searches the documents you can access and returns source passages with its response. Click a source to read it. Pin useful documents to your notebook.',detail:'Try: “How do heart scarabs differ from funerary scarabs?”',action:'See how to finish'},
 {tag:'03 / BUILD YOUR CASE',title:'Evidence first.<br>Theory second.',body:'Write your initial theory in the notebook to unlock follow-up statements and a final inspection. Recheck your assumptions, then submit your findings with supporting sources.',detail:'Your written reasoning is saved. Structured findings are checked against the case rubric.',action:'Enter the investigation'}
];
const introScenes=[
 {image:'casefile-cover.png',alt:'Casefile: The Swapped Scarab'},
 teachingScenes[0],
 {image:'briefing-trays.png',alt:'Three trays. One conflicting record. Concept illustration.'},
 teachingScenes[1],teachingScenes[2],
 {image:'briefing-research.png',alt:'Ask. Inspect. Connect. Concept illustration.'},
 teachingScenes[3],
 {image:'briefing-records.png',alt:'Answers are easy; evidence is harder. Concept illustration.'}
];
function showIntro(step=0){
 introStep=step;let el=$('#intro');
 if(!el){el=document.createElement('section');el.id='intro';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Investigation introduction');document.body.append(el)}
 const scene=introScenes[step],last=step===introScenes.length-1;
 el.className=scene.image?'image-scene':'teaching-scene';
 const next=`<button class="primary" id="intro-next">${last?'Enter the investigation':'Continue'} <span>→</span></button>`;
 el.innerHTML=`${scene.image?'':'<div class="intro-grid"></div>'}<div class="intro-top"><span>CASEFILE<span class="period">.</span></span><button id="skip-intro">Skip introduction ↗</button></div>${scene.image?`<div class="image-scene-content"><img src="assets/${scene.image}" alt="${scene.alt}" width="1672" height="940"></div>`:`<div class="intro-content"><div class="intro-copy"><span class="eyebrow">${scene.tag}</span><h1>${scene.title}</h1><p>${scene.body}</p><div class="intro-detail">${scene.detail}</div></div><div class="intro-art">${scarab}<div class="intro-art-label">EXHIBIT 001 / THE SCARAB · ILLUSTRATIVE SCULPTURE</div></div></div>`}<div class="intro-bottom"><button id="intro-back" ${step===0?'disabled':''}>← Back</button><div class="scene-dots">${introScenes.map((_,i)=>`<button data-scene="${i}" aria-label="Introduction step ${i+1}" aria-current="${i===step?'step':'false'}" class="${i===step?'on':''}"></button>`).join('')}</div><span>${step+1} / 8</span>${next}</div>`;
 document.querySelector('.sidebar').inert=true;document.querySelector('.shell').inert=true;
 $('#intro-next').onclick=()=>last?closeIntro():showIntro(step+1);
 $('#intro-back').onclick=()=>showIntro(step-1);$('#skip-intro').onclick=closeIntro;
 el.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>showIntro(Number(b.dataset.scene)));
 $('#intro-next').focus();el.scrollTop=0;animateSection(el.querySelector('.image-scene-content, .intro-content'));
 el.onkeydown=e=>{if(e.key==='Escape')closeIntro();if(e.key==='Tab'){const all=[...el.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===all.at(-1)){e.preventDefault();all[0].focus()}}};
}
function closeIntro(){localStorage.setItem('casefile-focus-'+token,'yes');document.body.classList.add('investigation-focus');document.body.classList.remove('arrival-screen');localStorage.setItem('casefile-intro-v2','seen');$('#intro')?.remove();document.querySelector('.sidebar').inert=false;document.querySelector('.shell').inert=false;$('#research')?.scrollIntoView();$('#question')?.focus()}
window.addEventListener('scroll',()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('.arrival')?.style.setProperty('--parallax',Math.min(scrollY*.1,28)+'px')},{passive:true});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#drawer')?.classList.contains('open'))closeDrawer()});

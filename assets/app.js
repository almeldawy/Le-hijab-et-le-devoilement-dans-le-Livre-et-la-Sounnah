(function(){
  var S={get:function(k,d){try{var v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},
         set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  var root=document.documentElement;
  var PAGE=location.pathname.split('/').pop()||'index.html';
  var CHAP=document.body.dataset.title||'';
  // Thème : suit l'appareil par défaut ; le bouton force clair/sombre
  var th=S.get('hj-theme',null); if(th) root.setAttribute('data-theme',th);
  document.getElementById('themeBtn').onclick=function(){
    var cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    var nx=cur==='dark'?'light':'dark'; root.setAttribute('data-theme',nx); S.set('hj-theme',nx);};
  // Taille du texte
  var fs=S.get('hj-fs',1.12); function applyFs(){root.style.setProperty('--fs',fs+'rem')} applyFs();
  document.getElementById('fsUp').onclick=function(){fs=Math.min(1.6,+(fs+.06).toFixed(2));applyFs();S.set('hj-fs',fs)};
  document.getElementById('fsDown').onclick=function(){fs=Math.max(.9,+(fs-.06).toFixed(2));applyFs();S.set('hj-fs',fs)};
  // Sommaire (tiroir mobile)
  var side=document.getElementById('side'),scrim=document.getElementById('scrim');
  function openNav(o){side.classList.toggle('open',o);scrim.hidden=!o}
  document.getElementById('menuBtn').onclick=function(){openNav(!side.classList.contains('open'))};
  scrim.onclick=function(){openNav(false)};
  side.addEventListener('click',function(e){if(e.target.closest('a')&&innerWidth<1100)openNav(false)});
  [].slice.call(document.querySelectorAll('#tocList a')).forEach(function(a){if(a.getAttribute('href')===PAGE){a.classList.add('cur');a.setAttribute('aria-current','page')}});
  // Message bref
  var toast=document.getElementById('toast'),tt;
  function say(m){toast.textContent=m;toast.hidden=false;clearTimeout(tt);tt=setTimeout(function(){toast.hidden=true},2200)}
  // Paragraphe en cours
  var paras=[].slice.call(document.querySelectorAll('main [id^="p"]'));
  function currentPara(){var y=90;for(var i=0;i<paras.length;i++){if(paras[i].getBoundingClientRect().bottom>y)return paras[i]}return paras[paras.length-1]}
  // Marque-pages (communs à toutes les pages)
  var bms=S.get('hj-bms2',[]);
  function renderBms(){var ul=document.getElementById('bmList');ul.innerHTML='';
    if(!bms.length){ul.innerHTML='<li class="empty">Aucun marque-page. Touchez « Marquer » pour enregistrer le passage en cours.</li>';return}
    bms.forEach(function(b,i){var li=document.createElement('li');
      li.innerHTML='<a><small></small><span></span></a><button aria-label="Supprimer">✕</button>';
      var a=li.querySelector('a');a.href=b.href;li.querySelector('small').textContent=b.sec;li.querySelector('span').textContent=b.txt;
      li.querySelector('button').onclick=function(){bms.splice(i,1);S.set('hj-bms2',bms);renderBms()};ul.appendChild(li)})}
  renderBms();
  var bmBtn=document.getElementById('bmBtn');
  if(!paras.length){bmBtn.hidden=true}
  bmBtn.onclick=function(){var p=currentPara();if(!p)return;var href=PAGE+'#'+p.id;
    bms=[{href:href,sec:CHAP.slice(0,70),txt:p.textContent.trim().slice(0,90)+'…'}].concat(bms.filter(function(b){return b.href!==href})).slice(0,30);
    S.set('hj-bms2',bms);renderBms();say('Marque-page ajouté')};
  // Reprendre la lecture
  var last=S.get('hj-last2',null);
  [].slice.call(document.querySelectorAll('.resumeBtn')).forEach(function(b){
    if(last&&last.href){b.hidden=false;b.onclick=function(){location.href=last.href}}});
  var prog=document.getElementById('prog'),ticking=false;
  function onScroll(){ticking=false;var h=document.documentElement;var pct=h.scrollTop/(h.scrollHeight-h.clientHeight||1);prog.style.width=(pct*100)+'%';
    if(paras.length){var p=currentPara();if(p)S.set('hj-last2',{href:PAGE+'#'+p.id,sec:CHAP})}}
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  // Notes en fenêtre
  var pop=document.getElementById('pop'),popTxt=document.getElementById('popTxt');
  document.addEventListener('click',function(e){var r=e.target.closest('a.ref');if(!r)return;e.preventDefault();
    var n=document.getElementById('n-'+r.dataset.n);if(!n)return;
    popTxt.innerHTML='<b>Note '+r.textContent+'.</b> '+n.children[1].innerHTML+' <a href="#n-'+r.dataset.n+'">Voir dans les notes</a>';pop.hidden=false});
  document.getElementById('popX').onclick=function(){pop.hidden=true};
  popTxt.addEventListener('click',function(e){if(e.target.tagName==='A')pop.hidden=true});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){pop.hidden=true;openNav(false)}});
})();

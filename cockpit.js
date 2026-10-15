// View navigation keeps the executive overview compact; analytical details remain available.
function showView(view,scroll=true){
 const valid=['executivo','prioridades','regional','empresas','evolucao','dados'];
 if(!valid.includes(view))view='executivo';
 document.querySelectorAll('main > [data-page]').forEach(el=>{el.hidden=el.dataset.page!==view});
 document.querySelectorAll('nav [data-view]').forEach(el=>{if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
 try{history.replaceState(null,'',location.pathname+location.search+'#'+view)}catch(e){}
 if(scroll)window.scrollTo({top:0,behavior:'instant'});
 if(view==='regional'&&regionalChart)regionalChart.resize();
 if(typeof Chart!=='undefined')Object.values(Chart.instances||{}).forEach(chart=>chart.resize());
}
const selectOriginal=setRegion;
setRegion=function(name,scroll=true){showView('regional',false);selectOriginal(name,false);if(scroll)window.scrollTo({top:0,behavior:'instant'})};
document.addEventListener('click',e=>{const link=e.target.closest('[data-view]');if(link){e.preventDefault();showView(link.dataset.view)}});
$('shareVisual').innerHTML='<div class="donut" role="img" aria-label="SENAI: 67,90% do estoque CAGED; diferença: 32,10%"><div class="donut-center"><strong>67,90%</strong><small>MarketShare CAGED</small></div></div>';
$('evolutionVisual').innerHTML='<svg class="trend-visual" viewBox="0 0 500 190" role="img" aria-label="MarketShare CAGED: 70,16%, 67,83% e 67,90%. Escala visual de 65 a 75%."><g stroke="#e5eaf1"><path d="M45 20H470M45 90H470M45 160H470"/></g><g fill="#526277" font-size="11"><text x="5" y="24">75%</text><text x="5" y="94">70%</text><text x="5" y="164">65%</text></g><path d="M65 87.76L255 120.38L445 119.4" fill="none" stroke="#2e5a88" stroke-width="3"/><g fill="#2e5a88" stroke="white" stroke-width="3"><circle cx="65" cy="87.76" r="6"/><circle cx="255" cy="120.38" r="6"/><circle cx="445" cy="119.4" r="6"/></g></svg><div class="trend-values"><span>1º trimestre<strong>70,16%</strong></span><span>2º trimestre<strong>67,83%</strong></span><span>3º trimestre<strong>67,90%</strong></span></div>';
const pendingTop=regionsData.slice().sort((a,b)=>b.semContrato-a.semContrato).slice(0,5);
$('pendingVisual').innerHTML=pendingTop.map(r=>'<button class="compact-bar" data-region="'+esc(r.name)+'" aria-label="'+esc(r.name)+': '+r.semContrato+' alunos sem contrato"><span>'+esc(r.name)+'</span><span class="track"><span class="fill" style="width:'+r.semContrato/181*100+'%"></span></span><strong>'+r.semContrato+'</strong></button>').join('');
$('regionTiles').className='tiles';
$('regionTiles').innerHTML=regionsData.map(r=>'<button class="tile" data-region="'+esc(r.name)+'" style="--tile-color:'+(r.ms>=80?'#087443':r.ms>=65?'#2e5a88':r.ms>=50?'#a44a08':'#b42335')+'"><span>'+esc(r.name)+'</span><strong>'+pct(r.ms)+'</strong></button>').join('');
$('companies').className='companies-layout';
$('companies').innerHTML=companies.map((c,i)=>'<div class="company-row"><span class="muted">'+String(i+1).padStart(2,'0')+'</span><span class="company-name">'+esc(c[0])+'<small>'+c[1]+'</small></span><div class="meter" aria-hidden="true"><span style="width:'+c[2]/396*100+'%"></span></div><strong>'+fmt(c[2])+'</strong><span class="share">'+pct(c[2]/total.contratos*100)+'</span></div>').join('');
const dataIntro=document.querySelector('#dados > .muted');
dataIntro.innerHTML='Recorte definido na análise regional. <a href="#regional" data-view="regional">Ajustar filtros →</a>';
showView(location.hash.slice(1)||($('regionSelect').value?'regional':'executivo'),false);

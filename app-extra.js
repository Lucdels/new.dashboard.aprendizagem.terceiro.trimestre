'use strict';
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('pt-BR');
const pct=n=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
const dec=n=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const sum=(rows,key)=>rows.reduce((a,r)=>a+r[key],0);
const total={contratos:sum(regionsData,'contratos'),alunos:sum(regionsData,'alunos'),cotas:sum(regionsData,'cotas'),mte:sum(regionsData,'mte'),semContrato:sum(regionsData,'semContrato'),cnpjs:2386};
const companies=[
 ['MARCOPOLO SA','88.611.835/0001-29',396],['JBS AVES LTDA.','08.199.996/0014-60',313],['CALÇADOS BEIRA RIO S/A','88.379.771/0001-82',192],['BRF S.A.','01.838.723/0001-27',185],['ALIBEM ALIMENTOS S.A.','03.941.052/0001-50',159],['STARA S.A. – INDÚSTRIA DE IMPLEMENTOS AGRÍCOLAS','91.495.499/0001-00',153],['VIBRA AGROINDUSTRIAL S/A','93.586.303/0001-19',138],['TRAMONTINA S.A. CUTELARIA','90.050.238/0001-14',131],['RANDONCORP S.A.','89.086.144/0001-16',119],['USAFLEX – INDÚSTRIA & COMÉRCIO S/A','86.900.925/0001-04',115]
];
let regionalChart,sortKey='ms',sortAsc=false,visible=regionsData.slice();
const columns=[['name','Sub-região'],['ms','MS CAGED (%)'],['delta','Δ ante 2º tri (p.p.)'],['alunos','Alunos'],['cnpjs','CNPJs regionais'],['contratos','Com contrato'],['semContrato','Sem contrato'],['pendingPct','Sem contrato (%)'],['formalizacao','Formalização (%)'],['cotas','Estoque CAGED'],['gap','Diferença CAGED–SENAI'],['cnpj','Contratos/CNPJ'],['mte','Potencial MTE'],['msMte','MS MTE (%)']];
regionsData.forEach(r=>{r.delta=r.ms-previous[r.name].ms;r.pendingPct=100*r.semContrato/r.alunos});
function metric(label,value,note,cls=''){return '<div class="card metric"><span class="label">'+esc(label)+'</span><strong class="'+cls+'">'+esc(value)+'</strong><small>'+esc(note)+'</small></div>'}
function queue(title,description,rows,key,unit){return '<div class="card"><h3>'+title+'</h3><p class="note">'+description+'</p>'+rows.map(r=>'<button class="queue" data-region="'+esc(r.name)+'"><span>'+esc(r.name)+'<small>'+ (key==='semContrato'?pct(r.pendingPct)+' das matrículas':key==='delta'?fmt(r.contratos)+' contratos':pct(r.ms)+' de participação')+'</small></span><strong>'+ (key==='delta'?dec(r.delta):fmt(r[key]))+unit+'</strong></button>'+(key==='semContrato'?'<div class="meter" aria-hidden="true"><span style="width:'+r[key]/rows[0][key]*100+'%"></span></div>':'')).join('')+'</div>'}
function initOverview(){
 $('stateKpis').innerHTML=metric('MarketShare CAGED',pct(100*total.contratos/total.cotas),'+0,07 p.p. ante o 2º tri')+metric('Contratos ativos',fmt(total.contratos),'+544 contratos · +3,72%')+metric('Alunos sem contrato',fmt(total.semContrato),'−346 alunos · −32,34%','positive')+metric('Formalização',pct(100*total.contratos/total.alunos),'+2,26 p.p. ante o 2º tri')+metric('CNPJs distintos',fmt(total.cnpjs),'+81 ante o 2º tri')+metric('MarketShare MTE',pct(100*total.contratos/total.mte),'Potencial MTE: '+fmt(total.mte));
 const pending=regionsData.slice().sort((a,b)=>b.semContrato-a.semContrato).slice(0,5),gap=regionsData.slice().sort((a,b)=>b.gap-a.gap).slice(0,5),loss=regionsData.filter(r=>r.delta<0).sort((a,b)=>a.delta-b.delta).slice(0,5);
 $('queues').innerHTML=queue('01 · Formalizar',fmt(sum(pending,'semContrato'))+' alunos nas cinco regiões: '+pct(100*sum(pending,'semContrato')/total.semContrato)+' do total sem contrato.',pending,'semContrato',' alunos')+queue('02 · Investigar expansão',fmt(sum(gap,'gap'))+' contratos na diferença CAGED–SENAI: '+pct(100*sum(gap,'gap')/(total.cotas-total.contratos))+'. Não equivale a vagas abertas.',gap,'gap','')+queue('03 · Recuperar participação','Cinco maiores quedas de MarketShare ante o 2º trimestre. Investigar mercado, encerramentos e reposições.',loss,'delta',' p.p.');
 $('companyKpis').innerHTML=metric('Top 10 CNPJs',pct(100*companies.reduce((a,c)=>a+c[2],0)/total.contratos),'1.901 contratos')+metric('Top 5 CNPJs',pct(100*companies.slice(0,5).reduce((a,c)=>a+c[2],0)/total.contratos),'1.245 contratos')+metric('Maior CNPJ',pct(100*companies[0][2]/total.contratos),'Marcopolo · 396 contratos');
 let accumulated=0;
 $('companies').innerHTML=companies.map((c,i)=>{accumulated+=c[2];return '<div><div class="marketline"><span class="company-name">'+(i+1)+'. '+esc(c[0])+'</span><strong>'+fmt(c[2])+' · '+pct(c[2]/total.contratos*100)+'</strong></div><div class="meter" aria-hidden="true"><span style="width:'+c[2]/companies[0][2]*100+'%"></span></div><details><summary>Identificação e participação acumulada</summary><p>CNPJ: '+c[1]+' · Acumulado até esta posição: '+fmt(accumulated)+' contratos ('+pct(accumulated/total.contratos*100)+').</p></details></div>'}).join('<hr style="border:0;border-top:1px solid #dce3eb;margin:18px 0">');
 $('market').innerHTML=[['TAM · Potencial MTE',total.mte],['SAM · Estoque CAGED',total.cotas],['SOM · Contratos SENAI',total.contratos]].map(([name,n])=>'<div class="marketline"><span>'+name+'</span><strong>'+fmt(n)+'</strong></div><div class="meter"><span style="width:'+100*n/total.mte+'%"></span></div>').join('')+'<p><strong>'+fmt(total.cotas-total.contratos)+'</strong> · Diferença CAGED–SENAI</p><p><strong>'+fmt(total.mte-total.cotas)+'</strong> · Diferença MTE–CAGED</p>';
 if(typeof Chart!=='undefined'){
 Chart.defaults.font.family='system-ui, Segoe UI, sans-serif';Chart.defaults.font.size=12;Chart.defaults.color='#526277';Chart.defaults.animation=window.matchMedia('(prefers-reduced-motion: reduce)').matches?false:undefined;
 new Chart($('trendChart'),{type:'line',data:{labels:['1º trimestre','2º trimestre','3º trimestre'],datasets:[{label:'MarketShare CAGED (%)',data:[70.16,67.83,67.90],borderColor:'#2e5a88',backgroundColor:'#2e5a88',pointRadius:6,tension:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}}}});
 }else{$('trendChart').parentElement.innerHTML='<p>Gráfico indisponível. Valores: 70,16% → 67,83% → 67,90%.</p>'}
}
function selection(){return regionsData.filter(r=>(!$('regionSelect').value||r.name===$('regionSelect').value)&&($('band').value==='all'||r.faixa===$('band').value)&&norm(r.name).includes(norm($('search').value.trim())))}
function setRegion(name,scroll=true){$('regionSelect').value=name;$('band').value='all';$('search').value='';render();if(scroll)$('regional').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function render(){
 visible=selection();
 const desc=($('regionSelect').value||'Todas as regiões')+' · '+$('band').selectedOptions[0].text+($('search').value?' · Busca: '+$('search').value:'');
 $('filterStatus').textContent=visible.length+' de 19 sub-regiões · '+desc+'. Indicadores estaduais não são alterados.';
 $('excel').disabled=!visible.length;
 renderChart();renderTable();renderPanel();
 const params=new URLSearchParams();if($('regionSelect').value)params.set('regiao',$('regionSelect').value);if($('band').value!=='all')params.set('faixa',$('band').value);if($('search').value)params.set('busca',$('search').value);
 try{history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash)}catch(e){}
}
function renderChart(){
 if(typeof Chart==='undefined')return;
 const rows=visible.slice().sort((a,b)=>b.ms-a.ms);
 if(regionalChart)regionalChart.destroy();
 $('regionalChart').parentElement.style.height=Math.max(240,rows.length*33+60)+'px';
 regionalChart=new Chart($('regionalChart'),{type:'bar',data:{labels:rows.map(r=>r.name),datasets:[{label:'MarketShare CAGED (%)',data:rows.map(r=>r.ms),backgroundColor:rows.map(r=>r.ms>=80?'#087443':r.ms>=65?'#2e5a88':r.ms>=50?'#a44a08':'#b42335'),borderRadius:3,maxBarThickness:23}]},plugins:[{id:'values',afterDatasetsDraw(chart){const {ctx}=chart;ctx.save();ctx.fillStyle='#202f46';ctx.font='11px system-ui';chart.getDatasetMeta(0).data.forEach((bar,i)=>{ctx.textAlign=rows[i].ms>84?'right':'left';ctx.fillStyle=rows[i].ms>84?'#ffffff':'#202f46';ctx.fillText(pct(rows[i].ms),bar.x+(rows[i].ms>84?-6:6),bar.y+4)});ctx.restore()}}],options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,onClick:(e,items)=>{if(items.length)setRegion(rows[items[0].index].name,false)},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>pct(c.raw)}}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%'}},y:{grid:{display:false},ticks:{font:{size:11}}}}}});
}
function cell(r,key){return ['ms','pendingPct','formalizacao','msMte'].includes(key)?pct(r[key]):['delta','cnpj'].includes(key)?dec(r[key]):typeof r[key]==='number'?fmt(r[key]):r[key]}
function renderTable(){
 const rows=visible.slice().sort((a,b)=>(typeof a[sortKey]==='number'?a[sortKey]-b[sortKey]:a[sortKey].localeCompare(b[sortKey],'pt-BR'))*(sortAsc?1:-1));
 $('dataTable').querySelector('thead').innerHTML='<tr>'+columns.map(([k,l])=>'<th scope="col"'+(k===sortKey?' aria-sort="'+(sortAsc?'ascending':'descending')+'"':'')+'><button data-sort="'+k+'">'+l+(k===sortKey?(sortAsc?' ↑':' ↓'):' ↕')+'</button></th>').join('')+'</tr>';
 $('dataTable').querySelector('tbody').innerHTML=rows.length?rows.map(r=>'<tr>'+columns.map(([k])=>'<td>'+(k==='name'?'<button data-region="'+esc(r.name)+'">'+esc(r.name)+'</button>':cell(r,k))+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="14" class="empty">Nenhuma região corresponde aos filtros. Use “Limpar filtros”.</td></tr>';
 $('tableCaption').textContent=rows.length+' sub-regiões · Ordenação: '+columns.find(c=>c[0]===sortKey)[1]+(sortAsc?' crescente':' decrescente')+' · CNPJs regionais não somáveis para obter distintos.';
}
function renderPanel(){
 const r=regionsData.find(r=>r.name===$('regionSelect').value);
 if(!visible.length){$('regionPanel').innerHTML='<h3>Nenhuma região encontrada</h3><p>Revise os filtros para consultar o diagnóstico.</p>';return}
 if(!r){const contracts=sum(visible,'contratos'),caged=sum(visible,'cotas'),students=sum(visible,'alunos');$('regionPanel').innerHTML='<p class="eyebrow">Resumo do recorte regional</p><h3>'+visible.length+' regiões selecionadas</h3><div class="grid regional-metrics">'+metric('MS ponderado',pct(contracts/caged*100),'Contratos ÷ CAGED do recorte')+metric('Com contrato',fmt(contracts),'Soma regional')+metric('Sem contrato',fmt(sum(visible,'semContrato')),'Soma regional')+metric('Formalização',pct(contracts/students*100),'Ponderada pelas matrículas')+'</div><p>Selecione uma região para consultar o playbook, as ações recomendadas e o PDF regional.</p><p class="note">Não é calculado um total distinto de CNPJs do recorte: a base agregada não permite deduplicar empresas entre regiões.</p>';return}
 const d=regionDetails[r.name];
 $('regionPanel').innerHTML='<p class="eyebrow">Diagnóstico e playbook regional</p><h3>'+esc(r.name)+'</h3><span class="pill">'+esc(d.prioridade)+'</span><div class="grid regional-metrics">'+metric('MS CAGED',pct(r.ms),dec(r.delta)+' p.p. ante 2º tri')+metric('Com contrato',fmt(r.contratos),fmt(r.cnpjs)+' CNPJs atendidos')+metric('Sem contrato',fmt(r.semContrato),pct(r.pendingPct)+' das matrículas')+metric('Formalização',pct(r.formalizacao),fmt(r.alunos)+' alunos')+'</div><p>'+esc(d.insight)+'</p><h3 style="margin-top:22px">Ações recomendadas</h3><ol class="actions">'+d.estrategias.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><details><summary>Mercado, densidade e evolução</summary><p>Estoque CAGED: '+fmt(r.cotas)+' · Diferença CAGED–SENAI: '+fmt(r.gap)+'.</p><p>Potencial MTE: '+fmt(r.mte)+' · MarketShare MTE: '+pct(r.msMte)+'.</p><p>Densidade: '+dec(r.cnpj)+' contratos/CNPJ. Essa média não comprova concentração empresarial.</p><p>MS CAGED do 1º ao 3º trimestre: '+r.hist.map(pct).join(' → ')+'.</p>'+(r.cotas>r.mte?'<p class="negative">CAGED superior ao potencial MTE informado: conferir recortes e competências.</p>':'')+'</details><details><summary>Acompanhamento, responsáveis e prazo</summary><p>'+esc(d.meta180)+'</p><p>Responsáveis sugeridos: '+esc(d.responsavel)+'</p><p>'+esc(d.prazo)+'</p><p>Medir casos revisados, registros corrigidos, encaminhamentos e contratos efetivados. Resultados de execução ainda não disponíveis nesta base.</p></details><button id="regionalPdf" class="primary" style="margin-top:20px">Exportar diagnóstico regional em PDF</button>';
}
function scenario(){
 const n=Number($('additional').value),target=Number($('target').value),growing=$('scenarioMode').value==='growing';
 if(!$('additional').value||!Number.isInteger(n)||n<0||n>100000||!$('target').value||target<=0||target>=100){$('scenarioResult').textContent='Informe contratos inteiros de 0 a 100.000 e uma referência maior que 0% e menor que 100%.';return}
 const denom=total.cotas+(growing?n:0),share=100*(total.contratos+n)/denom,t=target/100,required=Math.max(0,Math.ceil((t*total.cotas-total.contratos)/(growing?1-t:1)));
 $('scenarioResult').innerHTML='<strong style="font-size:25px">'+pct(share)+'</strong> de MarketShare no cenário · '+dec(share-100*total.contratos/total.cotas)+' p.p.<p>'+fmt(total.contratos+n)+' contratos SENAI ÷ '+fmt(denom)+' no CAGED.</p><p>Para a referência de '+pct(target)+', seriam necessários '+fmt(required)+' contratos adicionais ao ponto de partida; após a quantidade simulada, faltariam '+fmt(Math.max(0,required-n))+', sob a mesma hipótese.</p>'+(share>100?'<p class="negative">O cenário ultrapassa 100%: a hipótese de estoque fixo deixa de representar uma participação compatível com o universo de referência.</p>':'')+'<p class="note">Os 724 alunos sem contrato são casos a verificar, não conversões garantidas. A simulação não altera indicadores nem exportações observadas.</p>';
}
function exportExcel(){
 if(typeof XLSX==='undefined'){alert('Biblioteca de exportação indisponível. Os dados permanecem na tabela.');return}
 const wb=XLSX.utils.book_new();
 const rows=visible.slice().sort((a,b)=>(typeof a[sortKey]==='number'?a[sortKey]-b[sortKey]:a[sortKey].localeCompare(b[sortKey],'pt-BR'))*(sortAsc?1:-1));
 const sheet=XLSX.utils.aoa_to_sheet([columns.map(c=>c[1]),...rows.map(r=>columns.map(c=>r[c[0]]))]);sheet['!cols']=columns.map((c,i)=>({wch:i?23:28}));sheet['!autofilter']={ref:sheet['!ref']};
 rows.forEach((r,i)=>columns.forEach(([k],j)=>{const cell=sheet[XLSX.utils.encode_cell({r:i+1,c:j})];if(typeof r[k]==='number')cell.z=['ms','delta','pendingPct','formalizacao','cnpj','msMte'].includes(k)?'0.00':'#,##0'}));
 XLSX.utils.book_append_sheet(wb,sheet,'Seleção regional');
 const meta=[['Indicador / informação','Consolidado estadual integral'],['Período','3º trimestre de 2026'],['Versão','15/10/2026'],['Exportado em',new Date().toLocaleString('pt-BR')],['Recorte regional',$('filterStatus').textContent],['Contratos',total.contratos],['Alunos',total.alunos],['Sem contrato',total.semContrato],['Estoque CAGED',total.cotas],['Potencial MTE',total.mte],['CNPJs distintos estaduais',2386],['Soma dos CNPJs regionais',2579],['MarketShare CAGED (%)',100*total.contratos/total.cotas],['MarketShare MTE (%)',100*total.contratos/total.mte],['Nota','CNPJs não aditivos. Densidade não mede concentração. Gap não equivale a vagas abertas.'],['Percentuais','Valores em escala de 0 a 100; diferenças em pontos percentuais.'],['Fonte','Word do terceiro trimestre e relatórios anteriores; Top 10 em imagem fornecida pela área.']];
 const ms=XLSX.utils.aoa_to_sheet(meta);ms['!cols']=[{wch:35},{wch:110}];XLSX.utils.book_append_sheet(wb,ms,'Estado e metodologia');
 const cs=XLSX.utils.aoa_to_sheet([['Empresa','CNPJ','Contratos','Participação estadual (%)'],...companies.map(c=>[...c,100*c[2]/total.contratos])]);cs['!cols']=[{wch:56},{wch:22},{wch:16},{wch:28}];XLSX.utils.book_append_sheet(wb,cs,'Top 10 estadual');
 XLSX.writeFile(wb,'SENAI-RS_MarketShare_3tri2026.xlsx');
}
function exportPdf(){
 const r=regionsData.find(r=>r.name===$('regionSelect').value);if(!r)return;
 if(!window.jspdf){alert('Biblioteca de PDF indisponível.');return}
 const d=regionDetails[r.name],doc=new window.jspdf.jsPDF();let y=22;
 const safe=s=>String(s).replace(/[→]/g,' > ').replace(/[−–—]/g,'-').replace(/Δ/g,'Variacao');
 function write(text,size=10,bold=false){doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(32,47,70);const lines=doc.splitTextToSize(safe(text),174);for(const line of lines){if(y>275){doc.addPage();y=22}doc.text(line,18,y);y+=size*.48}y+=4}
 write('SENAI RS | MarketShare Aprendizagem',17,true);write(r.name+' | 3º trimestre de 2026',13,true);write('Versão: 15/10/2026 | Gerado em: '+new Date().toLocaleDateString('pt-BR'),9);
 write('INDICADORES OBSERVADOS',12,true);
 columns.filter(c=>c[0]!=='name').forEach(([k,label])=>write(label+': '+cell(r,k)));
 write('MS CAGED | 1º, 2º e 3º trimestres: '+r.hist.map(pct).join(' > '));
 write('DIAGNÓSTICO E PRIORIDADE',12,true);write(d.prioridade,11,true);write(d.insight);
 write('AÇÕES RECOMENDADAS',12,true);d.estrategias.forEach((s,i)=>write((i+1)+'. '+s));
 write('ACOMPANHAMENTO',12,true);write(d.meta180);write('Responsáveis sugeridos: '+d.responsavel);write(d.prazo);
 write('LEITURA DOS INDICADORES',12,true);write('Densidade é a média de contratos por CNPJ e não comprova concentração. A diferença CAGED-SENAI não representa vagas abertas. CNPJs regionais não são aditivos para contagem estadual.');
 if(r.cotas>r.mte)write('CAGED superior ao potencial MTE informado: verificar recortes e competências.');
 write('Fonte: relatório Word do 3º trimestre e comparativos anteriores. Vale dos Sinos 2: CAGED corrigido para 735. Ações e prazos sugeridos, sujeitos à pactuação local.',9);
 for(let p=1;p<=doc.getNumberOfPages();p++){doc.setPage(p);doc.setFontSize(8);doc.text('SENAI RS | '+p+' / '+doc.getNumberOfPages(),18,290)}
 doc.save('SENAI-RS_'+r.name.replace(/\s+/g,'_')+'_3tri2026.pdf');
}
document.addEventListener('click',e=>{const region=e.target.closest('[data-region]'),sort=e.target.closest('[data-sort]');if(region)setRegion(region.dataset.region);if(sort){sortAsc=sortKey===sort.dataset.sort?!sortAsc:false;sortKey=sort.dataset.sort;renderTable()}if(e.target.closest('#regionalPdf'))exportPdf()});
regionsData.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).forEach(r=>{const o=document.createElement('option');o.value=r.name;o.textContent=r.name;$('regionSelect').append(o)});
const initial=new URLSearchParams(location.search);if(regionsData.some(r=>r.name===initial.get('regiao')))$('regionSelect').value=initial.get('regiao');if(['all','lider','consolidada','desenvolvimento','critica'].includes(initial.get('faixa')))$('band').value=initial.get('faixa');$('search').value=initial.get('busca')||'';
$('regionSelect').onchange=()=>{$('band').value='all';$('search').value='';render()};$('band').onchange=()=>{$('regionSelect').value='';render()};$('search').oninput=()=>{$('regionSelect').value='';render()};$('reset').onclick=()=>setRegion('',false);
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('share').textContent='Link copiado';setTimeout(()=>$('share').textContent='Copiar link da seleção',2200)}catch(e){window.prompt('Copie o link da seleção:',location.href)}};
$('excel').onclick=exportExcel;['additional','target','scenarioMode'].forEach(id=>$(id).addEventListener('input',scenario));
initOverview();render();scenario();

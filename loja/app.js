(() => {
  'use strict';
  const owned = window.LEGACY_OWNED || [];
  const records = window.LEGACY_AFFILIATES || [];
  const brl = value => value.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  const el = (tag, cls, value) => {const node=document.createElement(tag); if(cls)node.className=cls; if(value!==undefined)node.textContent=value; return node;};
  // A prévia inclui dados transcritos dos prints, com sua data e pendências preservadas.
  const affiliates = [...new Map(records.filter(p => ['aprovado','capturado'].includes(p.status) && p.id && p.name && p.image && Number.isFinite(p.price) && p.price>0 && /^https:\/\/meli\.la\/[A-Za-z0-9]+$/.test(p.affiliateUrl)).map(p => [p.id,p])).values()];
  const dlg=document.getElementById('productDialog');
  const main=document.getElementById('mainPhoto');
  const thumbs=document.getElementById('thumbs');
  const action=dlg.querySelector('.ig');
  let current=null,photoIndex=0,lastFocus=null,returnHash='#colecao';
  const byId=new Map([...owned,...affiliates].map(p=>[p.id,p]));

  function card(p,isAffiliate=false){
    const c=el('button','watch-card'+(isAffiliate?' affiliate-card':''));c.type='button';c.dataset.id=p.id;c.setAttribute('aria-label','Ver detalhes de '+p.name);
    const visual=el('div','watch-image'),img=el('img');img.src=isAffiliate?p.image:p.photos[0];img.alt=p.name;img.loading=isAffiliate?'lazy':'eager';img.decoding='async';visual.append(img);
    const label=el('span','view-label','EXPLORAR PEÇA');label.append(el('span','','↗'));visual.append(label);
    const info=el('div','watch-info');info.append(el('div','eyebrow',isAffiliate?'CURADORIA / MERCADO LIVRE':p.tag),el('h3','',p.name));
    if(isAffiliate&&p.reference)info.append(el('p','model-ref',p.reference));
    const bottom=el('div','card-bottom');bottom.append(el('strong','',brl(p.price)),el('span','','VER DETALHES ↗'));info.append(bottom);c.append(visual,info);c.addEventListener('click',()=>open(p.id));return c;
  }
  document.querySelectorAll('#ownedGrid .native-watch summary').forEach(summary=>summary.addEventListener('click',event=>{event.preventDefault();open(summary.parentElement.dataset.id);}));

  function showPhoto(index){
    const photos=current.photos||[current.image];photoIndex=(index+photos.length)%photos.length;main.src=photos[photoIndex];main.alt=current.name+' — foto '+(photoIndex+1);
    document.getElementById('photoCounter').textContent=(photoIndex+1)+' / '+photos.length;
    [...thumbs.children].forEach((b,i)=>{b.classList.toggle('active',i===photoIndex);b.setAttribute('aria-pressed',String(i===photoIndex));});
  }
  function open(id,changeHash=true){
    const p=byId.get(id);if(!p)return;
    lastFocus=document.activeElement;returnHash=location.hash&&!byId.has(location.hash.slice(1))?location.hash:'#colecao';current=p;
    const affiliated=affiliates.includes(p);
    dlg.classList.toggle('affiliate-detail',affiliated);
    document.getElementById('detailTag').textContent=affiliated?p.brand.toUpperCase()+' / CURADORIA LEGACY':p.tag;
    document.getElementById('detailName').textContent=p.name;
    document.getElementById('detailPrice').textContent=brl(p.price)+(affiliated&&p.priceCondition==='no Pix'?' no Pix':'');
    document.getElementById('detailTerms').hidden=affiliated;
    document.getElementById('detailTerms').textContent='Preços à vista no Pix. Aceitamos parcelamento em até 10x no cartão de crédito, com acréscimo da maquininha. Entrega grátis em SP. Para os demais locais, frete a combinar.';
    document.getElementById('detailPeriod').textContent=affiliated?(p.reference||p.brand):p.period;
    document.getElementById('detailHistory').textContent=affiliated?p.description:p.history;
    document.getElementById('detailCondition').textContent=affiliated?'Preço exibido na captura de '+p.checkedAt+'. Confira preço e disponibilidade no anúncio.':p.condition;
    document.getElementById('detailFacts').replaceChildren(...(p.facts||[]).map(t=>el('li','',t)));
    const sourceNodes=(p.sources||[]).map(([name,url])=>{const a=el('a','',name+' ↗');a.href=url;a.target='_blank';a.rel='noopener';return a;});
    document.getElementById('detailSources').replaceChildren(...sourceNodes);
    action.href=affiliated?p.affiliateUrl:'https://www.instagram.com/legacy.relojoaria/';
    action.textContent=affiliated?'VER NO MERCADO LIVRE ↗':'INTERESSADO? CHAME POR DM NO INSTAGRAM ↗';
    action.rel=affiliated?'sponsored noopener noreferrer':'noopener';
    dlg.querySelector('.disclaimer').textContent=affiliated?'Venda realizada pelo parceiro. A Legacy pode receber comissão em compras elegíveis.':'Peça individual. Consulte a disponibilidade, o valor final do parcelamento e o frete por DM no Instagram.';
    thumbs.replaceChildren(...(p.photos||[p.image]).map((src,i)=>{const b=el('button');b.type='button';b.setAttribute('aria-label','Ver foto '+(i+1)+' de '+p.name);const im=el('img');im.src=src;im.alt='';im.loading='lazy';b.append(im);b.addEventListener('click',()=>showPhoto(i));return b;}));
    showPhoto(0);if(!dlg.open)dlg.showModal();document.body.classList.add('modal-open');if(changeHash)history.replaceState(null,'','#'+p.id);
  }
  document.getElementById('prevPhoto').addEventListener('click',()=>showPhoto(photoIndex-1));
  document.getElementById('nextPhoto').addEventListener('click',()=>showPhoto(photoIndex+1));
  document.getElementById('closeDialog').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
  dlg.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1);}if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1);}});
  dlg.addEventListener('close',()=>{document.body.classList.remove('modal-open');history.replaceState(null,'',returnHash);if(lastFocus&&lastFocus.isConnected)lastFocus.focus({preventScroll:true});});
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(byId.has(id))open(id,false);else if(dlg.open)dlg.close();});

  const grid=document.getElementById('affiliateGrid');
  const overflow=document.getElementById('morePicks');
  overflow.querySelectorAll('.affiliate-native').forEach(c=>grid.append(c));
  overflow.remove();
  let price='all',women=false,limit=12;
  const inRange=(value,key)=> key==='all'||(key==='500'&&value<=500)||(key==='1200'&&value>500&&value<=1200)||(key==='2000'&&value>1200&&value<=2000)||(key==='3000'&&value>2000&&value<=3000)||(key==='above'&&value>3000);
  function filter(){
    const matches=affiliates.filter(p=>inRange(p.price,price)&&(!women||p.feminine===true)).sort((a,b)=>a.price-b.price||a.number-b.number);
    const visible=matches.slice(0,limit),ids=new Set(visible.map(p=>p.id));
    grid.querySelectorAll('.affiliate-native').forEach(c=>{c.hidden=!ids.has(c.dataset.id);});
    document.getElementById('emptyPicks').hidden=matches.length>0;
    const selected=document.querySelector('.price-filters [data-price="'+price+'"]');
    document.getElementById('filterSummary').textContent=selected.textContent+(women?' · Femininos':'')+' · '+matches.length+' '+(matches.length===1?'indicação':'indicações');
    const more=document.getElementById('loadMore');more.hidden=matches.length<=limit;
    more.textContent='Ver mais relógios · +'+Math.min(12,Math.max(0,matches.length-limit));
    document.getElementById('pageCount').textContent=visible.length+' de '+matches.length+' indicações · menor para o maior preço';
  }
  document.querySelectorAll('.price-filters [data-price]').forEach(b=>b.addEventListener('click',()=>{price=b.dataset.price;limit=12;document.querySelectorAll('.price-filters [data-price]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();}));
  document.getElementById('womenFilter').addEventListener('click',e=>{women=!women;limit=12;e.currentTarget.setAttribute('aria-pressed',String(women));filter();});
  document.getElementById('loadMore').addEventListener('click',()=>{limit+=12;filter();});
  filter();
  if(byId.has(location.hash.slice(1)))open(location.hash.slice(1),false);
})();

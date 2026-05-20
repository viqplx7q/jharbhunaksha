var map = null;
var layers = {};
var currentExtent = null;
var currentGisCode = null;
var currentDCode = null;
var DATA = null;
var overlayCodes = [
  'EEmPkIKlQGeUJCllUzQsgg',
  'vM-FUjkNRaO1y-nPRNgpDA',
  'ZLYZdWFLSISAvZpQMluHNQ',
  'ENKdHcbBTUG3pX0_Q3wlAg',
  '6CqGkXc8TXqcJI3xEwcwPg',
  '-MCG6U2XTDiiK1uxY83pCg'
].join(',');

/* ── Sidebar ── */
function toggleSidebar() {
  var p = document.getElementById('pane');
  var s = document.getElementById('sidebar');
  var m = document.getElementById('map');
  if (p.classList.contains('open')) {
    p.classList.remove('open');
    m.classList.remove('sidebar-open');
  } else if (!s.classList.contains('hidden')) {
    s.classList.add('hidden');
    m.classList.add('fullscreen');
  } else {
    s.classList.remove('hidden');
    m.classList.remove('fullscreen');
    p.classList.add('open');
    m.classList.add('sidebar-open');
  }
}

function hidePane() {
  document.getElementById('pane').classList.remove('open');
  document.getElementById('map').classList.remove('sidebar-open');
  document.getElementById('sidebar').classList.remove('hidden');
  document.getElementById('map').classList.remove('fullscreen');
}

function showPane(name) {
  document.getElementById('sidebar').classList.remove('hidden');
  document.getElementById('map').classList.remove('fullscreen');
  var panes = document.querySelectorAll('.pane-content');
  for (var i=0;i<panes.length;i++) panes[i].style.display='none';
  var el = document.getElementById('pane-'+name);
  if (el) el.style.display='flex';
  document.getElementById('pane').classList.add('open');
  document.getElementById('map').classList.add('sidebar-open');
  var tabs = document.querySelectorAll('#sidebar .tab');
  for (var i=0;i<tabs.length;i++) tabs[i].classList.remove('active');
  var tabMap = {'home':0,'layers':1,'themes':2,'about':3};
  var idx = tabMap[name];
  if (idx!==undefined && tabs[idx]) tabs[idx].classList.add('active');
}

/* ── District Selector ── */
function populateDistricts() {
  var sel = document.getElementById('sel_dist');
  sel.innerHTML = '<option value="">-- चुनें --</option>';
  var keys = Object.keys(JHARKHAND).sort(function(a,b){
    return parseInt(a,10)-parseInt(b,10);
  });
  for (var i=0;i<keys.length;i++) {
    var d = JHARKHAND[keys[i]];
    var opt = document.createElement('option');
    opt.value = keys[i];
    var tm = 0;
    for (var c in d.circles) {
      for (var h in d.circles[c].halkas) {
        tm += d.circles[c].halkas[h].mouzas.length;
      }
    }
    opt.textContent = keys[i]+' - '+d.name+' ('+tm+')';
    sel.appendChild(opt);
  }
}

function onDistrictChange() {
  var dcode = document.getElementById('sel_dist').value;
  currentDCode = dcode;
  if (dcode && JHARKHAND[dcode]) {
    DATA = JHARKHAND[dcode];
    document.getElementById('sel_circle').disabled = false;
  } else {
    DATA = null;
    document.getElementById('sel_circle').disabled = true;
  }
  document.getElementById('sel_circle').innerHTML = '<option value="">-- चुनें --</option>';
  document.getElementById('sel_halka').innerHTML = '<option value="">-- चुनें --</option>';
  document.getElementById('sel_halka').disabled = true;
  document.getElementById('sel_mouza').innerHTML = '<option value="">-- चुनें --</option>';
  document.getElementById('sel_mouza').disabled = true;
  document.getElementById('btn_go').disabled = true;
  populateCircles();
}

/* ── Selectors ── */
function populateCircles() {
  var sel = document.getElementById('sel_circle');
  sel.innerHTML = '<option value="">-- चुनें --</option>';
  if (!DATA||!DATA.circles) return;
  var keys = Object.keys(DATA.circles).sort(function(a,b){
    return parseInt(a,10)-parseInt(b,10);
  });
  for (var i=0;i<keys.length;i++) {
    var c = DATA.circles[keys[i]];
    var opt = document.createElement('option');
    opt.value = keys[i];
    var hk=0; for(var h in c.halkas) if(c.halkas[h].mouzas.length>0) hk++;
    opt.textContent = keys[i]+' - '+c.name+' ('+hk+')';
    sel.appendChild(opt);
  }
}

function populateHalkas() {
  var ccode = document.getElementById('sel_circle').value;
  var sel = document.getElementById('sel_halka');
  sel.innerHTML = '<option value="">-- चुनें --</option>';
  sel.disabled = !ccode;
  document.getElementById('sel_mouza').innerHTML = '<option value="">-- चुनें --</option>';
  document.getElementById('sel_mouza').disabled = true;
  document.getElementById('btn_go').disabled = true;
  if (!ccode||!DATA||!DATA.circles||!DATA.circles[ccode]) return;
  var halkas = DATA.circles[ccode].halkas;
  var keys = Object.keys(halkas).sort(function(a,b){return parseInt(a,10)-parseInt(b,10);});
  for (var i=0;i<keys.length;i++) {
    var h = halkas[keys[i]];
    if (!h.mouzas||h.mouzas.length===0) continue;
    var opt = document.createElement('option');
    opt.value = keys[i];
    opt.textContent = keys[i]+' - '+h.name+' ('+h.mouzas.length+')';
    sel.appendChild(opt);
  }
}

function populateMouzas() {
  var ccode = document.getElementById('sel_circle').value;
  var hcode = document.getElementById('sel_halka').value;
  var sel = document.getElementById('sel_mouza');
  sel.innerHTML = '<option value="">-- चुनें --</option>';
  sel.disabled = !hcode;
  document.getElementById('btn_go').disabled = true;
  if (!ccode||!hcode||!DATA||!DATA.circles||!DATA.circles[ccode]||!DATA.circles[ccode].halkas[hcode]) return;
  var mouzas = DATA.circles[ccode].halkas[hcode].mouzas;
  for (var i=0;i<mouzas.length;i++) {
    var opt = document.createElement('option');
    opt.value = mouzas[i][0];
    opt.textContent = mouzas[i][0]+' - '+mouzas[i][1];
    sel.appendChild(opt);
  }
}

function enableGo() {
  var c = document.getElementById('sel_circle').value;
  var h = document.getElementById('sel_halka').value;
  var m = document.getElementById('sel_mouza').value;
  document.getElementById('btn_go').disabled = !(c&&h&&m);
}

/* ── Map ── */
function loadMap() {
  var dcode = document.getElementById('sel_dist').value;
  var ccode = document.getElementById('sel_circle').value;
  var hcode = document.getElementById('sel_halka').value;
  var mcode = document.getElementById('sel_mouza').value;
  if (!dcode||!ccode||!hcode||!mcode) return;
  if (!JHARKHAND[dcode]) return;
  var dist = JHARKHAND[dcode];
  var cname = dist.circles[ccode] ? dist.circles[ccode].name : ccode;
  var hname = dist.circles[ccode].halkas[hcode] ? dist.circles[ccode].halkas[hcode].name : hcode;
  var mname = '';
  var mouzas = dist.circles[ccode].halkas[hcode].mouzas;
  for (var i=0;i<mouzas.length;i++) {if(mouzas[i][0]===mcode){mname=mouzas[i][1];break;}}
  var gisCode = dcode+'_'+ccode+'_'+hcode+'_'+mcode;
  currentGisCode = gisCode;
  currentDCode = dcode;
  var ex = EXTENTS[gisCode];
  if (!ex) {
    document.getElementById('plotinfo').innerHTML='<span style=color:red>Extent not found: '+gisCode+'</span>';
    return;
  }
  currentExtent = [ex.xmin, ex.ymin, ex.xmax, ex.ymax];
  document.getElementById('plotinfo').innerHTML = '<b>'+dist.name+'</b> &rarr; '+cname+' &rarr; '+hname+' &rarr; '+mcode+' '+mname+'<br><span style=color:#888;font-size:11px>GIS: '+gisCode+'</span>';
  initMap(gisCode, currentExtent);
}

function initMap(gisCode, extent) {
  if (map) {
    map.getView().fit(extent, {padding:[30,30,30,30]});
    updateWmsParams(gisCode);
    return;
  }
  layers.v = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      url:'https://jharbhunaksha.jharkhand.gov.in/WMS',
      params:{'LAYERS':'VILLAGE_MAP','STATE':'20','GIS_CODE':gisCode,'STYLES':'VILLAGE_MAP','CRS':''},
      serverType:'geoserver'
    })
  });
  layers.o = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      url:'https://jharbhunaksha.jharkhand.gov.in/WMS',
      params:{'LAYERS':'OVERLAY_LAYER','TRANSPARENT':true,'STATE':'20','GIS_CODE':gisCode,'OVERLAY_CODES':overlayCodes,'CRS':''},
      serverType:'geoserver'
    }),
    opacity:0.85
  });
  layers.l = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      url:'https://jharbhunaksha.jharkhand.gov.in/WMS',
      params:{'LAYERS':'VILLAGE_MAP','TRANSPARENT':true,'STATE':'20','GIS_CODE':gisCode,'STYLES':'VILLAGE_MAP','CRS':''},
      serverType:'geoserver'
    }),
    opacity:1.0
  });
  map = new ol.Map({
    target:'map',
    layers:[layers.v, layers.o, layers.l],
    view:new ol.View({zoom:4,minZoom:0,maxZoom:28})
  });
  map.getView().fit(extent, {padding:[30,30,30,30]});
  map.addControl(new ol.control.ScaleLine({units:'metric'}));
  map.on('click', function(e) {
    document.querySelector('#plotinfo').innerHTML += '<br><span style=color:#666;font-size:11px>X:'+e.coordinate[0].toFixed(1)+' Y:'+e.coordinate[1].toFixed(1)+'</span>';
  });
  map.on('moveend', function() {
    var z = map.getView().getZoom();
    if (layers.l) layers.l.setOpacity(z>14?1.0:z>10?0.7:0.4);
  });
}

function updateWmsParams(gisCode) {
  if (layers.v) layers.v.getSource().updateParams({'LAYERS':'VILLAGE_MAP','STATE':'20','GIS_CODE':gisCode,'STYLES':'VILLAGE_MAP','CRS':''});
  if (layers.o) layers.o.getSource().updateParams({'LAYERS':'OVERLAY_LAYER','TRANSPARENT':true,'STATE':'20','GIS_CODE':gisCode,'OVERLAY_CODES':overlayCodes,'CRS':''});
  if (layers.l) layers.l.getSource().updateParams({'LAYERS':'VILLAGE_MAP','TRANSPARENT':true,'STATE':'20','GIS_CODE':gisCode,'STYLES':'VILLAGE_MAP','CRS':''});
}

function toggleLayer(name, vis) { if(layers[name]) layers[name].setVisible(vis); }
function setOpacity(name, val) { if(layers[name]) layers[name].setOpacity(parseFloat(val)); }
function resetView() { if(map&&currentExtent) map.getView().fit(currentExtent, {padding:[30,30,30,30]}); }

function selectTheme(el, theme) {
  var items = document.querySelectorAll('.theme-item');
  for(var i=0;i<items.length;i++) items[i].classList.remove('active');
  el.classList.add('active');
}

/* ── Search ── */
var searchTimer = null;
function doSearch(q) {
  clearTimeout(searchTimer);
  var el = document.getElementById('searchResults');
  if (!q || q.length < 2) { el.innerHTML = ''; return; }
  searchTimer = setTimeout(function() { performSearch(q); }, 300);
}

function performSearch(q) {
  var el = document.getElementById('searchResults');
  q = q.toLowerCase();
  var results = [];
  var maxResults = 30;
  for (var dk in JHARKHAND) {
    var d = JHARKHAND[dk];
    for (var ck in d.circles) {
      for (var hk in d.circles[ck].halkas) {
        for (var mi = 0; mi < d.circles[ck].halkas[hk].mouzas.length; mi++) {
          var m = d.circles[ck].halkas[hk].mouzas[mi];
          var mcode = m[0], mname = m[1];
          if (mname.toLowerCase().indexOf(q) !== -1 || mcode.indexOf(q) !== -1) {
            results.push({dcode:dk, dname:d.name, ccode:ck, cname:d.circles[ck].name, hcode:hk, hname:d.circles[ck].halkas[hk].name, mcode:mcode, mname:mname});
            if (results.length >= maxResults) break;
          }
        }
        if (results.length >= maxResults) break;
      }
      if (results.length >= maxResults) break;
    }
    if (results.length >= maxResults) break;
  }
  if (results.length === 0) { el.innerHTML = '<div class="search-noresult">No result found</div>'; return; }
  var html = '';
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    html += '<div class="search-item" onclick="selectFromSearch(\''+r.dcode+'\',\''+r.ccode+'\',\''+r.hcode+'\',\''+r.mcode+'\')">';
    html += '<span class="search-name">'+r.mcode+' - '+r.mname+'</span>';
    html += '<span class="search-path">'+r.dname+' &gt; '+r.cname+' &gt; '+r.hname+'</span>';
    html += '</div>';
  }
  if (results.length >= maxResults) html += '<div class="search-more">... more results (narrow your search)</div>';
  el.innerHTML = html;
}

function selectFromSearch(dcode, ccode, hcode, mcode) {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('sel_dist').value = dcode;
  onDistrictChange();
  document.getElementById('sel_circle').value = ccode;
  populateHalkas();
  document.getElementById('sel_halka').value = hcode;
  populateMouzas();
  document.getElementById('sel_mouza').value = mcode;
  enableGo();
  loadMap();
}
/* ── Init ── */
document.getElementById('sel_dist').addEventListener('change', onDistrictChange);
document.getElementById('sel_mouza').addEventListener('keydown', function(e){if(e.key==='Enter')loadMap();});
document.getElementById('sel_circle').addEventListener('change',function(){populateHalkas();populateMouzas();enableGo();});
document.getElementById('sel_halka').addEventListener('change',function(){populateMouzas();enableGo();});
document.getElementById('sel_mouza').addEventListener('change',enableGo);

// Show home pane, populate districts
showPane('home');
populateDistricts();
onDistrictChange();

// Update About coverage after load
var totalCircles = 0, totalHalkas = 0, totalMouzas = 0;
var dcount = 0;
for (var dk in JHARKHAND) {
  dcount++;
  var d = JHARKHAND[dk];
  for (var ck in d.circles) {
    totalCircles++;
    for (var hk in d.circles[ck].halkas) {
      totalHalkas++;
      totalMouzas += d.circles[ck].halkas[hk].mouzas.length;
    }
  }
}
document.getElementById('about-coverage').innerHTML = '<b>Coverage:</b> '+dcount+' Districts, '+totalCircles+' Circles, '+totalHalkas+' Halkas, '+totalMouzas+' Mouzas';

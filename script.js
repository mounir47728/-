const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const citySelect = document.getElementById('citySelect');
const backgroundSelect = document.getElementById('backgroundSelect');

const currentTimeEl = document.getElementById('currentTime');
const dateDisplayEl = document.getElementById('dateDisplay');
const remainingTimeEl = document.getElementById('remainingTime');
const prayerTable = document.getElementById('prayerTable');
const errorMessage = document.getElementById('errorMessage');

let currentTimeInterval = null;
let remainingTimeInterval = null;
let dateCycleTimer = null;

function saveSettings(city, background){
  localStorage.setItem('prayerCity', city);
  localStorage.setItem('bodyBackground', background);
}
function loadSettings(){
  return {
    city: localStorage.getItem('prayerCity') || '',
    background: localStorage.getItem('bodyBackground') || '1'
  };
}
function applyBackground(num){
  document.body.style.backgroundImage = `url('${num}.jpg')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}
function toEnglishNumbers(str){
  if(!str) return str;
  return str.replace(/[٠-٩]/g, d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}
function timeStrToDate(timeStr){
  const now = new Date();
  const parts = timeStr.split(':').map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), parts[0]||0, parts[1]||0, 0);
}
function getNextPrayer(times){
  const prayers = ['الفجر','الشروق','الظهر','العصر','المغرب','العشاء'];
  const now = new Date();
  for(let i=0;i<prayers.length;i++){
    if(timeStrToDate(times[prayers[i]])>now) return prayers[i];
  }
  return 'الفجر';
}
function highlightNextPrayer(nextPrayer){
  const rows = prayerTable.querySelectorAll('tbody tr');
  rows.forEach(row=>{
    row.classList.remove('next-prayer');
    if(row.children[0].textContent.trim()===nextPrayer) row.classList.add('next-prayer');
  });
}
function updateRemainingTime(times24, nextPrayer){
  const now = new Date();
  let pTime = timeStrToDate(times24[nextPrayer]);
  if(pTime <= now) pTime = new Date(pTime.getTime() + 24*60*60*1000);
  const diff = Math.max(0, Math.floor((pTime-now)/1000));
  const hh = String(Math.floor(diff/3600)).padStart(2,'0');
  const mm = String(Math.floor((diff%3600)/60)).padStart(2,'0');
  const ss = String(diff%60).padStart(2,'0');
  remainingTimeEl.textContent = `متبقي على الصلاة ${nextPrayer}: ${hh}:${mm}:${ss}`;
}
function updateCurrentTime(){
  const now = new Date();
  currentTimeEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}
function displayTimes(data){
  prayerTable.innerHTML = `
    <thead><tr><th>الصلاة</th><th>الوقت</th></tr></thead>
    <tbody>
      <tr><td>الفجر</td><td class="times">${toEnglishNumbers(data.الفجر)}</td></tr>
      <tr><td>الشروق</td><td class="times">${toEnglishNumbers(data.الشروق)}</td></tr>
      <tr><td>الظهر</td><td class="times">${toEnglishNumbers(data.الظهر)}</td></tr>
      <tr><td>العصر</td><td class="times">${toEnglishNumbers(data.العصر)}</td></tr>
      <tr><td>المغرب</td><td class="times">${toEnglishNumbers(data.المغرب)}</td></tr>
      <tr><td>العشاء</td><td class="times">${toEnglishNumbers(data.العشاء)}</td></tr>
    </tbody>
  `;
}
async function fetchPrayerTimes(city){
  try{
    const res = await fetch(`http://localhost:3000/api/pray?city=${city}`);
    if(!res.ok) throw new Error('خطأ في الاتصال بالخادم');
    const data = await res.json();
    if(data.error) throw new Error(data.error);
    return data;
  }catch(err){ throw err; }
}

let dateMode = 'gregorian';
function stopDateCycle(){ if(dateCycleTimer){clearTimeout(dateCycleTimer); dateCycleTimer=null;} }
function startDateCycle(){
  stopDateCycle(); dateMode='gregorian'; showDateMode();
  function scheduleNext(){
    dateCycleTimer = setTimeout(()=>{ dateMode = dateMode==='gregorian'?'hijri':'gregorian'; showDateMode(); scheduleNext(); }, dateMode==='gregorian'?12000:15000);
  }
  scheduleNext();
}
function showDateMode(){
  const now = new Date();
  if(dateMode==='gregorian') dateDisplayEl.textContent = now.toLocaleDateString('ar-DZ', { year:'numeric', month:'long', day:'numeric' });
  else {
    try{ dateDisplayEl.textContent = now.toLocaleDateString('ar-SA-u-ca-islamic', { year:'numeric', month:'long', day:'numeric' }); }
    catch(e){ dateDisplayEl.textContent = 'التقويم الهجري'; }
  }
}
function clearAllTimers(){
  if(currentTimeInterval) {clearInterval(currentTimeInterval); currentTimeInterval=null;}
  if(remainingTimeInterval) {clearInterval(remainingTimeInterval); remainingTimeInterval=null;}
  stopDateCycle();
}
async function loadAndShow(){
  const settings = loadSettings();
  if(!settings.city){ errorMessage.style.display='block'; errorMessage.textContent='يرجى اختيار الولاية من الإعدادات أولاً'; return; }
  else errorMessage.style.display='none';

  applyBackground(settings.background||'1');
  backgroundSelect.value = settings.background||'1';
  citySelect.value = settings.city;

  clearAllTimers();

  try{
    const data = await fetchPrayerTimes(settings.city);
    displayTimes(data);

    const times24 = {
      الفجر: toEnglishNumbers(data.الفجر),
      الشروق: toEnglishNumbers(data.الشروق),
      الظهر: toEnglishNumbers(data.الظهر),
      العصر: toEnglishNumbers(data.العصر),
      المغرب: toEnglishNumbers(data.المغرب),
      العشاء: toEnglishNumbers(data.العشاء)
    };

    function updateNextPrayerUI(){
      const nextPrayer = getNextPrayer(times24);
      highlightNextPrayer(nextPrayer);
      updateRemainingTime(times24, nextPrayer);
    }

    currentTimeInterval=setInterval(updateCurrentTime,1000);
    remainingTimeInterval=setInterval(updateNextPrayerUI,1000);
    startDateCycle();
    updateCurrentTime(); updateNextPrayerUI();

  }catch(err){ errorMessage.style.display='block'; errorMessage.textContent='⚠ '+(err.message||'خطأ في جلب المواقيت'); }
}

settingsBtn.addEventListener('click', ()=>{ 
  const show=!settingsPanel.classList.contains('show'); 
  settingsPanel.classList.toggle('show',show); 
  settingsBtn.setAttribute('aria-expanded', show?'true':'false'); 
});

saveSettingsBtn.addEventListener('click', ()=>{
  const selectedCity = citySelect.value;
  const selectedBg = backgroundSelect.value||'1';
  if(!selectedCity){ alert('يرجى اختيار ولاية صحيحة'); return; }
  saveSettings(selectedCity, selectedBg);
  applyBackground(selectedBg);
  settingsPanel.classList.remove('show');
  loadAndShow();
});

window.addEventListener('load', ()=>{
  const s = loadSettings();
  if(s.city) citySelect.value=s.city;
  if(s.background) backgroundSelect.value=s.background;
  applyBackground(s.background||'1');
  loadAndShow();
});

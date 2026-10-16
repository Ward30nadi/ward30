let currentLang = localStorage.getItem('ward30_lang') || '';
function setLanguage(lang){if(!['en','hi'].includes(lang))return;currentLang=lang;localStorage.setItem('ward30_lang',lang);document.documentElement.lang=lang;document.querySelectorAll('[data-en][data-hi]').forEach(el=>{el.innerHTML=el.dataset[lang]});document.getElementById('languageModal')?.classList.add('hidden');}
function toggleLanguage(){setLanguage(currentLang==='hi'?'en':'hi')}
const languageModal=document.getElementById('languageModal');
if(currentLang){setLanguage(currentLang)}else if(languageModal){languageModal.classList.remove('hidden');document.body.style.overflow='hidden';}
if(languageModal){languageModal.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{document.body.style.overflow=''}));}
document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('open'));
async function api(action,payload={}){const url=window.PORTAL_CONFIG?.API_URL;if(!url||url.includes('PASTE_APPS_SCRIPT_WEB_APP_EXEC_URL_HERE'))throw new Error('Portal backend is not connected yet. Add the Apps Script /exec URL in config.js and redeploy.');const r=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});const d=await r.json();if(!d.ok)throw new Error(d.error||'Request failed');return d}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function whatsappLink(number,text){const digits=String(number||'').replace(/\D/g,'');return digits?'https://wa.me/'+digits+'?text='+encodeURIComponent(text):''}
function whatsappShareLink(text){return 'https://wa.me/?text='+encodeURIComponent(text)}
function complaintPayloadFromForm(){return {name:document.getElementById('name').value.trim(),mobile:document.getElementById('mobile').value.trim(),category:document.getElementById('category').value.trim(),area:document.getElementById('area').value.trim(),details:document.getElementById('details').value.trim(),latitude:document.getElementById('latitude').value,longitude:document.getElementById('longitude').value,accuracy:document.getElementById('accuracy').value}}
function complaintWhatsAppText(payload,complaintNo=''){return `WARD 30 · NADI MOHALLA, PALI — CIVIC COMPLAINT\n${complaintNo?'Complaint ID: '+complaintNo+'\n':''}Name: ${payload.name}\nMobile: ${payload.mobile}\nCategory: ${payload.category}\nStreet/Landmark: ${payload.area}\nDetails: ${payload.details}${payload.latitude&&payload.longitude?'\nGPS: https://maps.google.com/?q='+payload.latitude+','+payload.longitude:''}\n\nSent from Ward 30 complaint portal.`}
const form=document.getElementById('complaintForm');
document.getElementById('area')?.addEventListener('focus',()=>{if(!document.getElementById('latitude').value&&!document.getElementById('longitude').value)captureGPS()},{once:true});
function captureGPS(){return new Promise(resolve=>{const st=document.getElementById('gpsStatus');if(!navigator.geolocation){if(st)st.textContent='GPS is not supported by this browser.';resolve(false);return}if(st)st.textContent='Requesting GPS permission…';navigator.geolocation.getCurrentPosition(pos=>{document.getElementById('latitude').value=pos.coords.latitude;document.getElementById('longitude').value=pos.coords.longitude;document.getElementById('accuracy').value=Math.round(pos.coords.accuracy);if(st)st.textContent=`GPS captured (±${Math.round(pos.coords.accuracy)} m).`;resolve(true);},err=>{if(st)st.textContent=err.code===1?'Location permission denied. You can still submit using your street/landmark.':'Could not get GPS. Check permission or enter your street/landmark.';resolve(false);},{enableHighAccuracy:true,timeout:20000,maximumAge:0})})}
const gpsBtn=document.getElementById('gpsBtn');
gpsBtn?.addEventListener('click',()=>captureGPS());
if(navigator.permissions?.query){navigator.permissions.query({name:'geolocation'}).then(p=>{if(p.state==='granted'&&!document.getElementById('latitude').value)captureGPS()}).catch(()=>{});}
// Location is requested only after the visitor explicitly taps the GPS button or focuses the location field.
const mediaInput=document.getElementById('mediaFiles');
const photoInput=document.getElementById('photoCapture'),videoInput=document.getElementById('videoCapture');
function selectedMedia(){return [...(photoInput?.files||[]),...(videoInput?.files||[]),...(mediaInput?.files||[])].filter(Boolean).slice(0,3)}
const takePhotoBtn=document.getElementById('takePhotoBtn'),recordVideoBtn=document.getElementById('recordVideoBtn'),chooseMediaBtn=document.getElementById('chooseMediaBtn');
// Invoke the native picker directly from the user's tap; this is required by mobile browsers.
takePhotoBtn?.addEventListener('click',()=>photoInput?.click());
recordVideoBtn?.addEventListener('click',()=>videoInput?.click());
chooseMediaBtn?.addEventListener('click',()=>mediaInput?.click());
let previewUrls=[];
function refreshMediaPreview(changed){
 const files=selectedMedia(),preview=document.getElementById('mediaPreview');
 previewUrls.forEach(u=>URL.revokeObjectURL(u));previewUrls=[];preview.innerHTML='';
 if(files.length>3){if(changed)changed.value='';preview.textContent='Choose up to 3 files total.';return}
 for(const file of files){
  const isVideo=String(file.type||'').startsWith('video/'),limit=isVideo?1.5*1024*1024:12*1024*1024;
  if(file.size>limit){if(changed)changed.value='';preview.textContent=(isVideo?'Video':'Photo')+' is too large. Maximum selected-file size: '+(isVideo?'1.5 MB':'12 MB')+'. '+(isVideo?'Record a shorter video.':'Choose a smaller photo.');return}
  const url=URL.createObjectURL(file);previewUrls.push(url);const el=document.createElement(isVideo?'video':'img');el.src=url;
  if(isVideo){el.controls=true;el.playsInline=true;el.preload='metadata'}
  el.style.maxWidth='140px';el.style.maxHeight='120px';preview.appendChild(el);
 }
}
[mediaInput,photoInput,videoInput].forEach(input=>input?.addEventListener('change',()=>refreshMediaPreview(input)));

async function fileAsDataURL(file){
 const type=String(file.type||'').toLowerCase(),isVideo=type.startsWith('video/');
 if(!(type.startsWith('image/')||isVideo))throw new Error('Only photo and video files are allowed.');
 const limit=isVideo?1.5*1024*1024:2.5*1024*1024;
 let uploadFile=file;
 if(!isVideo){
  if(['image/heic','image/heif'].includes(type))throw new Error('This phone selected HEIC/HEIF. Change camera format to Most Compatible/JPEG, then retry.');
  if(typeof createImageBitmap==='function'){
   let bitmap;
   try{bitmap=await createImageBitmap(file);const maxSide=1280,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.68));if(blob)uploadFile=new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});}catch(_){/* fallback to selected image */}finally{if(bitmap)bitmap.close();}
  }
 }
 if(uploadFile.size>limit)throw new Error((isVideo?'Video':'Photo')+' is too large after preparation. Maximum '+(isVideo?'1.5 MB':'2.5 MB')+'. '+(isVideo?'Record a shorter clip (about 5–10 seconds) or compress it before upload.':'Choose a smaller photo.'));
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve({name:uploadFile.name,mimeType:uploadFile.type||'application/octet-stream',dataUrl:r.result});r.onerror=()=>reject(new Error('Could not read '+file.name));r.readAsDataURL(uploadFile)});
}
form?.addEventListener('submit',async e=>{
 e.preventDefault();const msg=document.getElementById('formMessage'),btn=document.getElementById('submitBtn');const selected=selectedMedia();
 if(selected.length>3){msg.className='error';msg.textContent='Please select no more than 3 files.';return}
 for(const f of selected){const v=String(f.type||'').startsWith('video/'),lim=v?1.5*1024*1024:12*1024*1024;if(f.size>lim){msg.className='error';msg.textContent=(v?'Video':'Photo')+' exceeds the '+(v?'1.5 MB':'12 MB')+' original-file limit. Please choose a smaller file.';return}}
 // Open a tab synchronously during the user gesture; later navigation is less likely to be blocked.
 const waTab=window.open('about:blank','_blank');if(waTab){try{waTab.document.write('<title>Submitting complaint…</title><p style="font-family:Arial;padding:24px">Your complaint is being submitted. This tab will open WhatsApp after successful registration.</p>')}catch(_){}}
 btn.disabled=true;btn.textContent=currentLang==='hi'?'भेजा जा रहा है…':'Submitting…';msg.className='';msg.textContent='Preparing attachments and submitting complaint…';
 const payload={...complaintPayloadFromForm(),ward:'30',locality:'Nadi Mohalla, Pali, Rajasthan'};
 try{
  if(selected.length){payload.media=[];for(let i=0;i<selected.length;i++){msg.textContent='Preparing attachment '+(i+1)+' of '+selected.length+'…';payload.media.push(await fileAsDataURL(selected[i]));}}
  msg.textContent='Saving complaint…';const data=await api('submitComplaint',payload);
  msg.className='success';msg.innerHTML=`<b>Complaint registered successfully.</b><br>Complaint ID: <b>${escapeHtml(data.complaintNo)}</b><br>Save this ID to track updates later.`;
  if(data.mediaUrls?.length)msg.innerHTML+=`<br>${data.mediaUrls.length} media file(s) saved to Drive.`;
  const waNumber=window.PORTAL_CONFIG?.PARSHAD_WHATSAPP_NUMBER||'',waText=complaintWhatsAppText(payload,data.complaintNo),waUrl=whatsappLink(waNumber,waText);
  if(data.whatsappSent){msg.innerHTML+='<br><b>WhatsApp alert sent automatically to the Parshad.</b>';if(waTab)waTab.close();}
  else if(waUrl){msg.innerHTML+='<br><b>Opening WhatsApp…</b><br>If it does not open, use the WhatsApp button below.';const a=document.createElement('a');a.className='btn primary whatsapp-btn';a.href=waUrl;a.target='_blank';a.rel='noopener';a.textContent='Open WhatsApp to send complaint';msg.appendChild(a);if(waTab){waTab.location.href=waUrl;}else{window.location.href=waUrl;}}
  else{if(waTab)waTab.close();msg.innerHTML+='<br><span class="muted">Configure the Parshad WhatsApp number in config.js.</span>';}
  form.reset();[photoInput,videoInput,mediaInput].forEach(x=>{if(x)x.value=''});previewUrls.forEach(u=>URL.revokeObjectURL(u));previewUrls=[];document.getElementById('mediaPreview').innerHTML='';document.getElementById('latitude').value='';document.getElementById('longitude').value='';document.getElementById('accuracy').value='';document.getElementById('gpsStatus').textContent='Location not captured for next complaint yet.';
 }catch(err){if(waTab)waTab.close();msg.className='error';msg.innerHTML=`<b>Complaint could not be registered:</b> ${escapeHtml(err.message)}<br><small>Please retry. WhatsApp is opened only after the backend confirms successful registration.</small>`;}
 finally{btn.disabled=false;btn.textContent=currentLang==='hi'?'शिकायत भेजें →':'Submit Complaint →';}
});

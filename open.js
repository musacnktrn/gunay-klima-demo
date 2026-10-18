// ureten: codex. A fresh entry URL bridges old workers without navigating other documents.
(async()=>{
 const base=new URL('./',document.currentScript.src),status=document.getElementById('opening-status'),retry=document.getElementById('opening-retry');
 const target=new URL('crm/index.html?space=demo',base);
 retry.onclick=()=>location.reload();
 if(!('serviceWorker'in navigator)||!navigator.onLine){location.replace(target);return;}
 navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='GK_UPDATE_STATUS')event.ports[0]?.postMessage({dirty:false,version:2});});
 const version=worker=>new Promise(resolve=>{if(!worker)return resolve(null);const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve(null);},700);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.version);};worker.postMessage('GK_VERSION',[channel.port2]);});
 try{
  const response=await fetch(new URL('release.json',base),{cache:'reload'}).catch(()=>null);if(!response&&navigator.serviceWorker.controller){location.replace(target);return;}if(!response?.ok)throw Error('Sürüm bilgisi alınamadı.');const release=await response.json();
  const registration=await navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname,updateViaCache:'none'});await registration.update();
  const until=Date.now()+25000;
  while(Date.now()<until){
   if(registration.waiting)registration.waiting.postMessage('ACTIVATE_UPDATE');
   if(await version(navigator.serviceWorker.controller)===release.version){location.replace(target);return;}
   await new Promise(resolve=>setTimeout(resolve,150));
  }
  throw Error('CRM henüz hazır değil. Yeniden deneyebilirsiniz.');
 }catch(error){status.textContent=error.message+' Kayıtlarınız korunuyor.';retry.hidden=false;}
})();

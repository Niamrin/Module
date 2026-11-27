import { geometry } from "./components/modules/mapping/geometry.js";
import DOMPurify from 'dompurify';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>globalThis.crypto?.randomUUID?.()||'m'+Date.now().toString(36)+Math.random().toString(36).slice(2);
const types={text:['Текст','T','Текст и структура'],image:['Изображение','▧','Мультимедиа'],carousel:['Карусель','▣','Мультимедиа'],mapping:['Изображение с маппингом','⊙','Мультимедиа'],list:['Список','☷','Текст и структура'],tabs:['Табы','▥','Интерактив'],video:['Видео','▷','Мультимедиа'],spoiler:['Спойлер','⌄','Интерактив'],quiz:['Тест','☑','Проверка знаний']};
const sampleImage=(label,n=0)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="400" viewBox="0 0 840 400"><rect width="840" height="400" fill="#eef1e7"/><rect x="115" y="65" width="610" height="270" rx="22" fill="white" stroke="#d0d8c0" stroke-width="2"/><rect x="145" y="96" width="180" height="207" rx="12" fill="${['#c1db18','#d5e485','#b4c9ad'][n%3]}"/><rect x="349" y="111" width="337" height="24" rx="8" fill="#36434a"/><rect x="349" y="157" width="285" height="14" rx="6" fill="#c8cfd0"/><rect x="349" y="184" width="310" height="14" rx="6" fill="#dbe0e0"/><rect x="349" y="211" width="248" height="14" rx="6" fill="#dbe0e0"/><rect x="349" y="252" width="120" height="32" rx="8" fill="#c1db18"/><text x="420" y="370" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#53604d">${esc(label)}</text></svg>`);
function make(type){
 if(type==='quiz') return {id:uid(),type,hidden:false,data:{title:'Проверка знаний',attempts:0,minutes:0,threshold:80,questions:[make('single')]}};
 const data={text:{body:'## Новый раздел\n\nВведите текст учебного материала.'},image:{src:'',caption:'',alt:'',width:100},carousel:{slides:[{src:'',caption:'',alt:''},{src:'',caption:'',alt:''}]},mapping:{src:'',alt:'',caption:'',points:[]},list:{ordered:false,items:['Первый пункт','Второй пункт']},tabs:{tabs:[{id:uid(),blocks:[],title:'Вариант А',body:'Описание первого варианта.'},{id:uid(),blocks:[],title:'Вариант Б',body:'Описание второго варианта.'}]},video:{src:'',caption:''},spoiler:{blocks:[],title:'Дополнительная информация',body:'Текст примечания.',open:false},single:{question:'Введите текст вопроса',options:[{id:uid(),text:'Вариант 1',correct:true},{id:uid(),text:'Вариант 2',correct:false}],explanation:''},multiple:{question:'Введите текст вопроса',options:[{id:uid(),text:'Вариант 1',correct:true},{id:uid(),text:'Вариант 2',correct:true},{id:uid(),text:'Вариант 3',correct:false}],explanation:''}};return {id:uid(),type,hidden:false,data:data[type]};}
function demo(){let a=Object.keys(types).filter(t=>t!=='quiz').concat('single','multiple').map(make),by=t=>a.find(x=>x.type===t).data;by('text').body='## Добро пожаловать!\n\nЭто демонстрационный урок. Каждый блок можно **редактировать**, перемещать и копировать.\n\n==Выберите модуль слева, чтобы добавить его на страницу.==';Object.assign(by('image'),{src:sampleImage('Пример изображения'),caption:'Иллюстрация учебного материала',alt:'Схематичный макет страницы'});by('carousel').slides=[0,1,2].map(i=>({src:sampleImage('Слайд '+(i+1),i),caption:'Слайд '+(i+1),alt:'Демонстрационный слайд '+(i+1)}));Object.assign(by('mapping'),{src:sampleImage('Интерактивная схема',1),alt:'Схема с активными областями',caption:'Нажмите на номера, чтобы увидеть пояснения.',points:[{id:uid(),x:28,y:49,title:'Иллюстрация',body:'Визуальная часть учебного материала.'},{id:uid(),x:61,y:31,title:'Заголовок',body:'Обозначает тему раздела.'},{id:uid(),x:49,y:67,title:'Действие',body:'Элемент управления или переход.'}]});by('list').items=['Изучите материал','Посмотрите примеры','Ответьте на контрольные вопросы'];by('tabs').tabs=[{title:'Теория',body:'**Теория** помогает понять основные принципы.'},{title:'Практика',body:'**Практика** позволяет применить знания.'},{title:'Отличия',body:'Теория объясняет, практика закрепляет.'}];by('video').caption='Добавьте видео по ссылке или загрузите файл.';by('spoiler').body='Здесь размещаются дополнительные сведения, исключения и примечания.';Object.assign(by('single'),{question:'Какой модуль используется для скрытых примечаний?',options:['Карусель','Спойлер','Список'].map((text,i)=>({id:uid(),text,correct:i===1})),explanation:'Спойлер раскрывает дополнительный текст по нажатию.'});Object.assign(by('multiple'),{question:'Какие модули относятся к изображениям?',options:['Карусель','Табы','Изображение с маппингом','Обычное изображение'].map((text,i)=>({id:uid(),text,correct:i!==1})),explanation:'Обычное изображение, карусель и маппинг — три вида визуальных модулей.'});const quiz=make('quiz');quiz.data.questions=a.splice(-2);a.push(quiz);return {version:1,title:'Демонстрационный курс',description:'Пример страницы, собранной из учебных модулей.',blocks:a};}
const isQuestion=b=>['single','multiple'].includes(b.type), arr=x=>Array.isArray(x)?x:[], str=x=>typeof x==='string'?x:'';
function normalize(raw, ids = new Set(), freshIds = false){if(!raw||!Array.isArray(raw.blocks))throw Error('Неверный формат курса');
 const blocks=[];
 let legacy=null;
 for(const block of raw.blocks){
   if(block && isQuestion(block)){
     if(!legacy || legacy.hidden!==!!block.hidden){
       legacy=make('quiz'); legacy.hidden=!!block.hidden; legacy.id=block.id; legacy.data.questions=[]; blocks.push(legacy);
     }
     legacy.data.questions.push(block);
   }else{legacy=null; blocks.push(block)}
 }
 const slideIds = new Set();
 const slides = arr(raw.slides).filter(s=>s && typeof s === 'object').map((s,i)=>{
   const id = typeof s.id === 'string' && /^[\w-]{1,100}$/.test(s.id) && !slideIds.has(s.id) ? s.id : uid();
   slideIds.add(id);
   return {id,title:str(s.title).trim() || 'Слайд '+(i+1)};
 });
 if(raw.format==='presentation' && !slides.length) slides.push({id:uid(),title:'Начало курса'});
 return {version:1,format:raw.format==='presentation'?'presentation':'page',slides,title:str(raw.title)||'Новый курс',description:str(raw.description),blocks:blocks.filter(b=>b&&Object.hasOwn(types,b.type)).map(b=>{let v=make(b.type),d=b.data&&typeof b.data==='object'?b.data:{};if(!freshIds && typeof b.id==='string'&&/^[\w-]{1,100}$/.test(b.id)&&!ids.has(b.id))v.id=b.id;ids.add(v.id);if(slides.length)v.slideId=slideIds.has(b.slideId)?b.slideId:slides[0].id;v.hidden=!!b.hidden;let z=v.data;for(let k of Object.keys(z)){if(typeof z[k]==='string')z[k]=str(d[k]??z[k]);else if(typeof z[k]==='boolean')z[k]=typeof d[k]==='boolean'?d[k]:z[k];}if(b.type==='image')z.width=Math.min(100,Math.max(25,Number(d.width)||100));if(b.type==='list')z.items=arr(d.items??z.items).map(str);if(b.type==='carousel')z.slides=arr(d.slides??z.slides).map(x=>({src:str(x?.src),caption:str(x?.caption),alt:str(x?.alt)}));if(b.type==='tabs')z.tabs=arr(d.tabs??z.tabs).map(x=>({id:uid(),title:str(x?.title),body:str(x?.body),blocks:normalize({blocks:arr(x?.blocks)},ids,freshIds).blocks}));if(b.type==='spoiler')z.blocks=normalize({blocks:arr(d.blocks)},ids,freshIds).blocks;if(b.type==='mapping')z.points=arr(d.points).map(x=>({id:uid(),...geometry(x || {}),title:str(x?.title),body:str(x?.body)}));if(v.type==='quiz'){
 for(const key of ['attempts','minutes','threshold']){
   const value=Number(d[key]);
   if(Number.isSafeInteger(value)&&value>=0) z[key]=Math.min(key==='threshold'?100:9999,value);
 }
 z.questions=arr(d.questions??z.questions).filter(q=>q&&isQuestion(q)).map(q=>{
   const item=make(q.type), source=q.data||{};
   item.data={question:str(source.question),explanation:str(source.explanation),options:arr(source.options).map(o=>({id:uid(),text:str(o?.text),correct:!!o?.correct}))};
   return item;
 });
}return v;})};}
function inline(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/__(.+?)__/g,'<u>$1</u>').replace(/==(.+?)==/g,'<mark>$1</mark>').replace(/\*(.+?)\*/g,'<em>$1</em>');}
const richPrefix = 'course-rich:v1:';
function encodeRich(html) {
  return richPrefix + html;
}
function rich(s) {
  if (typeof s === 'string' && s.startsWith(richPrefix)) {
    const html = DOMPurify.sanitize(s.slice(richPrefix.length), {
      ALLOWED_TAGS: ['p','br','h1','h2','h3','h4','strong','em','u','mark','ul','ol','li'],
      ALLOWED_ATTR: ['start'], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
    });
    return '<div class="rich">' + html + '</div>';
  }
  return '<div class="rich">'+str(s).split(/\r?\n/).filter(x=>x.trim()).map(line=>{let h=line.match(/^(#{1,4})\s+(.+)$/);return h?`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`:`<p>${inline(line)}</p>`}).join('')+'</div>';}
function safeMedia(src,kind='image'){if(typeof src!=='string'||!src.trim())return '';const s=src.trim();if(kind==='image'&&/^data:image\/(png|jpeg|jpg|gif|webp|avif|svg\+xml|bmp)(?:;[^,]*)?,/i.test(s))return s;if(kind==='video'&&/^data:video\/(mp4|webm|ogg)(?:;[^,]*)?,/i.test(s))return s;try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function embed(src){try{let u=new URL(src),host=u.hostname.replace(/^www\./,'');let id;if(host==='youtu.be')id=u.pathname.split('/')[1];if(['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host))id=u.searchParams.get('v')||u.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))return 'https://www.youtube-nocookie.com/embed/'+id;if(['vimeo.com','player.vimeo.com'].includes(host)&&(id=u.pathname.match(/\/(?:video\/)?(\d+)/)?.[1]))return 'https://player.vimeo.com/video/'+id;if(host==='rutube.ru'&&(id=u.pathname.match(/\/(?:video|play\/embed)\/([a-f0-9]{32})/i)?.[1]))return 'https://rutube.ru/play/embed/'+id;}catch{}return '';}
function questionErrors(b){let d=b.data,n=d.options.filter(o=>o.correct).length;return [!d.question.trim()?'Введите вопрос.':'',d.options.length<2||d.options.some(o=>!o.text.trim())?'Нужно минимум два заполненных варианта.':'',b.type==='single'&&n!==1?'Выберите ровно один правильный ответ.':'',b.type==='multiple'&&n<2?'Выберите не менее двух правильных ответов.':'',b.type==='multiple'&&n===d.options.length?'Добавьте хотя бы один неправильный вариант.':''].filter(Boolean)}
function correct(b,s){let keys=b.data.options.filter(o=>o.correct).map(o=>o.id);return !questionErrors(b).length&&keys.length===s.answers.length&&keys.every(x=>s.answers.includes(x));}
function exportFile(content,name,type){let blob=new Blob([content],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
export {uid,types,make,demo,isQuestion,normalize,inline,rich,encodeRich,safeMedia,embed,questionErrors,correct,exportFile};

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=['model.js','components/Fields.js','components/QuizView.js','components/ModuleView.js','components/ModuleEditor.js','App.js'];
const code=files.map(p=>read('src/'+p).replace(/^import .*;\s*$/gm,'').replace(/^export \{.*\};\s*$/gm,'').replace(/^export /gm,'')).join('\n');
const html=`<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Конструктор курса · Vue 3</title><style>${read('src/style.css')}</style></head><body><div id="app" v-cloak></div><script id="seed" type="application/json">null</script><script>${read('vendor/vue.global.js').replace(/<\/script/gi,'<\\/script')}</script><script>\nwindow.__COURSE_SOURCE__='<!doctype html>\\n'+document.documentElement.outerHTML;\n(()=>{const {createApp,ref,computed,watch,nextTick,onBeforeUnmount}=Vue;\n${code.replace(/<\/script/gi,'<\\/script')}\ncreateApp(App).mount('#app');})();\n</script></body></html>`;
fs.mkdirSync(path.join(root,'public'),{recursive:true});fs.writeFileSync(path.join(root,'public/course_builder_vue3.html'),html);

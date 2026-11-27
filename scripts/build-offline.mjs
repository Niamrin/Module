import { build } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';

const [{ output }] = await build({
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    write: false,
    lib: { entry: 'src/main.js', formats: ['iife'], name: 'CourseBuilder' },
  },
});
const script = output.find(item => item.type === 'chunk').code;
const css = output.find(item => item.fileName.endsWith('.css')).source;
const shell = await readFile('index.html', 'utf8');
const capture = "window.__COURSE_SOURCE__ = '<!doctype html>\\n' + document.documentElement.outerHTML;";
const html = shell
  .replace('</head>', () => '<style>' + css + '</style></head>')
  .replace('<script type="module" src="/src/main.js"></script>', () =>
    '<script>' + capture + '\n' + script.replace(/<\/script/gi, '<\\/script') + '</script>');
await writeFile('public/course_builder_vue3.html', html);

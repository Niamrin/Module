import { build } from "vite";
import { readFile, writeFile } from "node:fs/promises";

const shell = await readFile("index.html", "utf8");
async function bundlePage(entry, name) {
  const [{ output }] = await build({
    publicDir: false,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: { write: false, lib: { entry, formats: ["iife"], name } },
  });
  const script = output.find(item => item.type === "chunk").code;
  const css = output.find(item => item.fileName.endsWith(".css")).source;
  return shell
    .replace("</head>", () => "<style>" + css + "</style></head>")
    .replace('<script type="module" src="/src/main.js"></script>', () =>
      "<script>" + script.replace(/<\/script/gi, "<\\/script") + "</script>");
}

const student = (await bundlePage("src/student.js", "CourseLesson"))
  .replace(/<title>[^<]*<\/title>/, "<title>Учебная страница</title>");
await writeFile("public/student-template.html", student);

const builder = await bundlePage("src/main.js", "CourseBuilder");
const embedded = JSON.stringify(student).replaceAll("<", "\\u003c");
await writeFile("public/course_builder_vue3.html", builder.replace(
  '<div id="app"', () => '<script id="student-template" type="application/json">' + embedded + '</script><div id="app"'
));

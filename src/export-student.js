const titleMarker = "<title>Учебная страница</title>";
const seedMarker = '<script id="seed" type="application/json">null</script>';

async function readTemplate() {
  const embedded = document.getElementById("student-template");
  if (embedded) return JSON.parse(embedded.textContent);
  const response = await fetch(new URL("student-template.html", document.baseURI));
  if (!response.ok) throw new Error("Шаблон страницы недоступен");
  return response.text();
}

export async function renderStudentPage(course) {
  const template = await readTemplate();
  if (!template.includes(titleMarker) || !template.includes(seedMarker)) {
    throw new Error("Неверный шаблон страницы");
  }
  const title = (course.title.trim() || "Учебная страница")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const seed = JSON.stringify(course).replaceAll("<", "\\u003c");
  return template.replace(titleMarker, () => "<title>" + title + "</title>")
    .replace(seedMarker, () => seedMarker.replace("null", () => seed));
}

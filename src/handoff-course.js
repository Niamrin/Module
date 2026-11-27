import { make, uid } from "./model.js";

export function handoffCourse() {
  const slides = [
    "Конец смены",
    "Карточка заявки",
    "Передайте заявку",
    "Памятка для смены",
  ].map((title) => ({ id: uid(), title }));
  const blocks = [];
  function add(index, type, data) {
    const block = make(type);
    block.slideId = slides[index].id;
    Object.assign(block.data, data);
    blocks.push(block);
    return block;
  }

  add(0, "text", {
    body: "До конца смены пять минут. Клиент ждёт ответ до 18:00, а склад ещё проверяет заказ. В 17:30 ваш коллега откроет заявку. Что ему нужно знать, чтобы продолжить работу уже сегодня?",
  });
  add(0, "text", {
    body: "## Задача\nОставьте запись, по которой следующая смена сможет выполнить обещание клиенту.",
  });
  add(1, "text", {
    body: "Откройте три метки. Каждая показывает одно из условий удачной передачи.",
  });
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="320" viewBox="0 0 720 320"><rect width="720" height="320" rx="16" fill="#eef1e8"/><g font-family="Arial,sans-serif" fill="#29372c"><text x="30" y="48" font-weight="bold" font-size="26">Заявка № 1842</text><g fill="#fff"><rect x="24" y="68" width="672" height="65" rx="8"/><rect x="24" y="145" width="672" height="65" rx="8"/><rect x="24" y="222" width="672" height="65" rx="8"/></g><g font-size="23"><text x="75" y="108">Склад проверяет заказ</text><text x="75" y="185">Ответ клиенту до 18:00</text><text x="75" y="262">Анна · уточнить статус в 17:40</text></g></g></svg>';
  add(1, "mapping", {
    src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    alt: "Заявка 1842. Склад проверяет заказ. Клиент ждёт до 18:00. Анна уточнит статус в 17:40.",
    points: [
      {
        id: uid(),
        x: 6.5,
        y: 31,
        title: "Что уже сделано",
        body: "Запрос на склад отправлен. Повторно создавать его не нужно.",
      },
      {
        id: uid(),
        x: 6.5,
        y: 55,
        title: "Что обещано",
        body: "Даже если склад задержится, клиенту нужен ответ до 18:00.",
      },
      {
        id: uid(),
        x: 6.5,
        y: 79,
        title: "Кто продолжит",
        body: "Анна проверит статус в 17:40. У неё останется время связаться с клиентом.",
      },
    ],
  });
  const quiz = add(2, "quiz", {
    title: "Какую запись оставить коллеге?",
    minutes: 3,
  });
  quiz.data.questions[0].data = {
    question:
      "Клиенту обещали прислать счёт до 12:00. Бухгалтерия уже получила запрос. Выберите запись для следующей смены.",
    options: [
      { id: uid(), text: "Срочно! Клиент ждёт счёт.", correct: false },
      {
        id: uid(),
        text: "Счёт запрошен. Ирина проверит почту в 11:30 и отправит счёт клиенту до 12:00.",
        correct: true,
      },
      {
        id: uid(),
        text: "Направили запрос в бухгалтерию, ждём.",
        correct: false,
      },
    ],
    explanation:
      "В записи есть статус, обещание клиенту, ответственный и время следующего действия.",
  };
  add(3, "list", {
    ordered: true,
    items: [
      "Укажите, что уже сделано и какой ответ получен.",
      "Запишите, что обещали клиенту и к какому сроку.",
      "Назовите ответственного, следующее действие и время проверки.",
    ],
  });
  return {
    version: 1,
    format: "presentation",
    title: "Передача заявки коллеге",
    description: "Как передать незавершённую заявку следующей смене",
    slides,
    blocks,
  };
}

import { createApp } from "vue";
import CourseLesson from "./components/CourseLesson.vue";
import "./style.css";

const course = JSON.parse(document.getElementById("seed").textContent);
if (course) createApp(CourseLesson, { course, student: true }).mount("#app");

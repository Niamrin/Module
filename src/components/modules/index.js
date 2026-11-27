import CarouselEditor from "./carousel/CarouselEditor.vue";
import CarouselView from "./carousel/CarouselView.vue";
import ImageEditor from "./image/ImageEditor.vue";
import ImageView from "./image/ImageView.vue";
import ListEditor from "./list/ListEditor.vue";
import ListView from "./list/ListView.vue";
import MappingEditor from "./mapping/MappingEditor.vue";
import MappingView from "./mapping/MappingView.vue";
import QuizEditor from "./quiz/QuizEditor.vue";
import QuizView from "./quiz/QuizView.vue";
import SpoilerEditor from "./spoiler/SpoilerEditor.vue";
import SpoilerView from "./spoiler/SpoilerView.vue";
import TabsEditor from "./tabs/TabsEditor.vue";
import TabsView from "./tabs/TabsView.vue";
import TextEditor from "./text/TextEditor.vue";
import TextView from "./text/TextView.vue";
import VideoEditor from "./video/VideoEditor.vue";
import VideoView from "./video/VideoView.vue";

export const modules = {
  carousel: { editor: CarouselEditor, view: CarouselView },
  image: { editor: ImageEditor, view: ImageView },
  list: { editor: ListEditor, view: ListView },
  mapping: { editor: MappingEditor, view: MappingView },
  quiz: { editor: QuizEditor, view: QuizView },
  spoiler: { editor: SpoilerEditor, view: SpoilerView },
  tabs: { editor: TabsEditor, view: TabsView },
  text: { editor: TextEditor, view: TextView },
  video: { editor: VideoEditor, view: VideoView },
};

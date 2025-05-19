import { configureStore } from "@reduxjs/toolkit";
import courseSlice from "./slices/courseSlice";
import moduleSlice from "./slices/moduleSlice";
import topicSlice from "./slices/topicSlice";
import instructorSlice from "./slices/instructorSlice.ts";
import categorySlice from "./slices/categorySlice.js";
import successStorySlice from "./slices/SuccessStorySlice.ts";
import userSlice from "./slices/userSlice.ts";
import { UserState } from "@/types";
import videoSlice, { VideoState } from "./slices/videoSlice.ts";
import assignmentSlice from "./slices/assignmentSlice";
import questionSlice from "./slices/questionSlice";
import notificationSlice from "./slices/notificationSlice.ts";

export interface RootState {
  notifications: any;
  course: ReturnType<typeof courseSlice.reducer>;
  module: ReturnType<typeof moduleSlice.reducer>;
  topic: ReturnType<typeof topicSlice.reducer>;
  instructor: ReturnType<typeof instructorSlice.reducer>;
  category: ReturnType<typeof categorySlice.reducer>;
  successStory: ReturnType<typeof successStorySlice.reducer>;
  user: UserState;
  video: VideoState;
  assignment: ReturnType<typeof assignmentSlice.reducer>;
}
const store = configureStore({
  reducer: {
    course: courseSlice.reducer,
    module: moduleSlice.reducer,
    topic: topicSlice.reducer,
    instructor: instructorSlice.reducer,
    category: categorySlice.reducer,
    successStory: successStorySlice.reducer,
    user: userSlice.reducer,
    video: videoSlice.reducer,
    assignment: assignmentSlice.reducer,
    question: questionSlice.reducer,
    notifications: notificationSlice.reducer,
  },
});

// export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

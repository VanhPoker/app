import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  courseConstructionSlice,
  CourseConstructionState,
} from "./course-construction/slice";
import { AuthState, AuthTokenSlice } from "./auth/slice";

export const CourseConstructionStore = create<CourseConstructionState>()(
  devtools(
    (set, get, store) => ({
      ...courseConstructionSlice(set, get, store),
    }),
    { name: "course-management" }
  )
);

export const useAuthStore = create<AuthState>()(
  devtools(
    persist<AuthState>(
      (...a) => ({
        ...AuthTokenSlice(...a),
      }),
      { name: "auth-storage" }
    ),
    { name: "auth" }
  )
);

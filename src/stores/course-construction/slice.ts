import { StateCreator } from "zustand";
export interface CourseConstructionState {
  courseData: {
    id: number;
    layoutId: number | null;
    notificationConfigId: number;
    courseScheduleId: number | null;
    courseFormatId: number;
    courseCertificationId: number;
    courseCostId: number;
    url: string;
    description: string | null;
    enrollStatedDate: string;
    enrollClosedDate: string | null;
    isHasCertification: number;
    isScheduleByTeacher: boolean;
    isCostFree: boolean;
    layoutName: string;
    preCourses: any;
    preSkills: any;
    limit: any;
    typeLimit: any;
    notification: {
      id: number;
      receivedOverMail: boolean;
      receivedOverSystem: boolean;
      isDefault: boolean;
      isDeleted: boolean;
      notificationsType: any;
    };
    image: string | null;
    assigner: {
      courseAssignId: number;
      enterpriseId: string;
      enterpriseName: string;
      isSponsor: boolean;
      assigned: {
        assignUserId: number;
        assignUserName: string;
        imageCourseAssign: string | null;
        instruct: boolean;
        construct: boolean;
      }[];
    }[];
  };

  setCourseData: (data: Partial<CourseConstructionState["courseData"]>) => void;
}

export const courseConstructionSlice: StateCreator<CourseConstructionState> = (
  set
) => ({
  courseData: {
    id: 0,
    layoutId: null,
    notificationConfigId: 0,
    courseScheduleId: null,
    courseFormatId: 0,
    courseCertificationId: 0,
    courseCostId: 0,
    url: "",
    description: null,
    enrollStatedDate: "",
    enrollClosedDate: null,
    isHasCertification: 0,
    isScheduleByTeacher: false,
    isCostFree: false,
    layoutName: "",
    preCourses: null,
    preSkills: null,
    limit: null,
    typeLimit: null,
    notification: {
      id: 0,
      receivedOverMail: false,
      receivedOverSystem: false,
      isDefault: false,
      isDeleted: false,
      notificationsType: null,
    },
    image: null,
    assigner: [],
  },

  setCourseData: (data) =>
    set((state) => ({ courseData: { ...state.courseData, ...data } })),
});

import type { Transition } from "framer-motion";

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export const SPRING_SMOOTH: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};
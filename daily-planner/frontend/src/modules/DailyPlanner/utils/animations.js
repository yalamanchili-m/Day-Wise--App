export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, repeat: Infinity }
  }
};
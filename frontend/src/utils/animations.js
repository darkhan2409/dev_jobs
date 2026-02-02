// Centralized animation configuration for consistent "Clean Tech" feel

export const springConfig = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1
};

export const softSpring = {
    type: "spring",
    stiffness: 50,
    damping: 15,
    mass: 1
};

export const easeOutExpo = [0.19, 1, 0.22, 1];

export const duration = {
    fast: 0.2,
    medium: 0.4,
    slow: 0.8
};

export const staggerDelay = 0.1;

export const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
        filter: "blur(5px)"
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.4,
            ease: easeOutExpo
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: "blur(5px)",
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            ...springConfig
        }
    }
};

export const scaleOnHover = {
    scale: 1.02,
    transition: {
        duration: 0.2,
        ease: "easeOut"
    }
};

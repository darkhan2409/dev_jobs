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
    hidden: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            ...springConfig
        }
    },
    visible: {
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

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const cardHoverVariants = {
    hover: {
        y: -8,
        scale: 1.01,
        boxShadow: "0px 12px 24px rgba(124, 58, 237, 0.1)", // primary/10
        borderColor: "rgba(124, 58, 237, 0.5)", // primary/50
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    }
};

// Pipeline Guide animations
export const pipelinePulse = {
    animate: {
        scale: [1, 1.12, 1],
        boxShadow: [
            "0 0 0 0 rgba(124, 58, 237, 0)",
            "0 0 0 12px rgba(124, 58, 237, 0.25)",
            "0 0 0 0 rgba(124, 58, 237, 0)"
        ],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
};

export const drawLine = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.8, ease: easeOutExpo }
    }
};

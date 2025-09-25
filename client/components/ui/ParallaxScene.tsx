import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function ParallaxScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 25]);

  return (
    <div ref={ref} className="relative h-64 md:h-80">
      <motion.div
        style={{ y: y1, rotate }}
        className="absolute right-6 top-6 text-6xl"
      >
        🏀
      </motion.div>
      <motion.div
        style={{ y: y2 }}
        className="absolute right-20 bottom-6 text-5xl"
      >
        🏈
      </motion.div>
      <motion.div
        style={{ y: y1 }}
        className="absolute right-1/3 top-16 h-24 w-24 rounded-full bg-primary/20 blur-2xl"
      />
    </div>
  );
}

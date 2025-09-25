import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: number;
}

export default function SportsBall({ className, size = 64 }: Props) {
  return (
    <motion.div
      className={cn("select-none", className)}
      initial={{ y: 0, rotate: 0, scale: 0.95, opacity: 0 }}
      animate={{ y: [0, -16, 0], rotate: [0, 15, -15, 0], scale: 1, opacity: 1 }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        style={{ width: size, height: size }}
        className="rounded-full grid place-items-center text-3xl shadow-xl"
      >
        <span className="drop-shadow-sm">⚽️</span>
      </div>
    </motion.div>
  );
}

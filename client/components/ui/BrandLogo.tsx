import { motion } from "framer-motion";

export default function BrandLogo() {
  return (
    <a href="/" className="flex items-center gap-2 group">
      <motion.span
        className="grid place-items-center h-8 w-8 rounded-full bg-primary text-primary-foreground shadow"
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 12 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        ⚽
      </motion.span>
      <span className="text-xl font-extrabold tracking-tight group-hover:text-primary transition-colors">
        SportFlow
      </span>
    </a>
  );
}

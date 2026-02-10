import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../utils/animations';

export default function KeyDecisions({ decisions }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Ключевые решения</h3>
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2.5"
      >
        {decisions.map((decision, i) => (
          <motion.li
            key={i}
            variants={fadeInUp}
            className="flex items-start gap-2.5 text-sm text-slate-400"
          >
            <CheckCircle2 size={16} className="text-violet-400/60 mt-0.5 flex-shrink-0" />
            <span>{decision}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

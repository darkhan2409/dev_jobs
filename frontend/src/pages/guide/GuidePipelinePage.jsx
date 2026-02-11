import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  PenTool,
  Code2,
  ShieldCheck,
  Rocket,
} from 'lucide-react';
import { GUIDE_STAGES } from '../../data/guideData';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const ICON_MAP = { Lightbulb, PenTool, Code2, ShieldCheck, Rocket };

export default function GuidePipelinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [hoveredId, setHoveredId] = useState(null);

  const recommendedStageId = useMemo(() => {
    const queryStageId = searchParams.get('recommendedStageId');
    if (queryStageId && GUIDE_STAGES.some((stage) => stage.id === queryStageId)) {
      return queryStageId;
    }

    const stateStageId = location.state?.recommendedStageId;
    if (stateStageId && GUIDE_STAGES.some((stage) => stage.id === stateStageId)) {
      return stateStageId;
    }

    return null;
  }, [location.state, searchParams]);

  const recommendedStage = recommendedStageId
    ? GUIDE_STAGES.find((stage) => stage.id === recommendedStageId)
    : null;

  const stageQuery = recommendedStageId ? `?recommendedStageId=${recommendedStageId}` : '';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* ── Hero ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="text-center mb-20"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-bold leading-tight mb-6"
        >
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Как создаются IT-продукты
          </span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Структурированное представление этапов и ролей
        </motion.p>

        {recommendedStage && (
          <motion.div
            variants={fadeInUp}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200"
          >
            Рекомендованный этап: <span className="font-semibold">{recommendedStage.name}</span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Pipeline ── */}
      <div className="relative">
        {/* Background connecting line (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

        <div className="flex flex-col md:flex-row md:justify-between items-center gap-12 md:gap-0">
          {GUIDE_STAGES.map((stage) => {
            const Icon = ICON_MAP[stage.icon];
            const isHovered = hoveredId === stage.id;
            const isRecommended = recommendedStageId === stage.id;
            const isHighlighted = isHovered || isRecommended;

            return (
              <div
                key={stage.id}
                className="relative flex flex-col items-center group"
                onMouseEnter={() => setHoveredId(stage.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Card */}
                <motion.button
                  onClick={() => navigate(`/guide/${stage.id}${stageQuery}`)}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative z-10 w-36 h-36 rounded-2xl flex items-center justify-center
                    bg-[#1F2833] backdrop-blur-sm border-2 cursor-pointer
                    transition-all duration-300
                    ${isHighlighted
                      ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] -translate-y-3'
                      : 'border-slate-700 hover:border-purple-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:-translate-y-3'
                    }
                  `}
                >
                  {isRecommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                      Рекомендовано
                    </span>
                  )}
                  {Icon && (
                    <Icon
                      size={48}
                      style={{ color: isHighlighted ? '#ffffff' : stage.color }}
                      className="transition-colors duration-300 group-hover:text-white"
                    />
                  )}
                </motion.button>

                {/* Title + English subtitle */}
                <div className="mt-5 text-center">
                  <h3
                    className={`text-2xl font-bold transition-colors duration-300 ${
                      isHighlighted ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {stage.name}
                  </h3>
                  <p className="text-base font-mono tracking-widest uppercase text-purple-400 mt-1">
                    {stage.nameEn}
                  </p>
                </div>

                {/* Tooltip */}
                <div
                  className={`
                    absolute top-full mt-4 left-1/2 -translate-x-1/2 z-20
                    w-72 bg-slate-800/95 backdrop-blur-xl border border-slate-600
                    rounded-xl shadow-2xl p-4
                    transition-all duration-300
                    ${isHovered
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2'
                    }
                  `}
                >
                  {/* Arrow */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800/95 border-l border-t border-slate-600 rotate-45" />
                  <p className="text-base font-medium leading-relaxed text-slate-300 relative z-10">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

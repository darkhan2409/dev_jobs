import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getArtifact, getGuideStage } from '../../data/guideData';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { cn } from '../../utils/cn';

export default function GuideArtifactPage() {
  const { artifactId } = useParams();
  const navigate = useNavigate();

  const artifact = getArtifact(artifactId);

  useEffect(() => {
    if (!artifact) {
      navigate('/guide', { replace: true });
    }
  }, [artifact, navigate]);

  if (!artifact) {
    return null;
  }

  const stage = getGuideStage(artifact.stageId);
  const Icon = LucideIcons[artifact.icon];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <motion.button
        onClick={() => navigate(stage ? `/guide/${stage.id}` : '/guide')}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        {stage ? `Назад к «${stage.name}»` : 'Назад'}
      </motion.button>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Definition Block */}
        <motion.div
          variants={fadeInUp}
          className={cn(
            'rounded-2xl overflow-hidden',
            'bg-slate-900/80 border border-slate-700/40',
            'p-4 sm:p-6 md:p-8'
          )}
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              {Icon && <Icon size={22} className="text-violet-400" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{artifact.nameRu}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{artifact.name}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{artifact.definition}</p>

          {/* Stage badge */}
          {stage && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-600">Этап:</span>
              <button
                onClick={() => navigate(`/guide/${stage.id}`)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {stage.order}. {stage.name}
              </button>
            </div>
          )}
        </motion.div>

        {/* Why it matters */}
        <motion.div
          variants={fadeInUp}
          className={cn(
            'rounded-xl p-5',
            'bg-amber-500/5 border border-amber-500/15'
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Зачем это нужно?</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {artifact.whyItMatters}
          </p>
        </motion.div>

        {/* Related Skills */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Связанные навыки
          </h3>
          <div className="flex flex-wrap gap-2">
            {artifact.relatedSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Related Tools */}
        <motion.div variants={fadeInUp}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Инструменты
          </h3>
          <div className="flex flex-wrap gap-2">
            {artifact.relatedTools.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/50 text-slate-400 border border-slate-700/40"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

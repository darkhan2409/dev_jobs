import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Package } from 'lucide-react';
import StageHeader from '../../components/guide/StageHeader';
import WhyBlock from '../../components/guide/WhyBlock';
import KeyDecisions from '../../components/guide/KeyDecisions';
import RoleCard from '../../components/guide/RoleCard';
import ArtifactCard from '../../components/guide/ArtifactCard';
import { getGuideStage, getArtifactsForStage } from '../../data/guideData';
import { guideApi } from '../../api/guideApi';
import { fadeInUp, staggerContainer } from '../../utils/animations';

export default function GuideStageDetailPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const [stageData, setStageData] = useState(null);
  const [loading, setLoading] = useState(true);

  const stage = getGuideStage(stageId);
  const artifacts = getArtifactsForStage(stageId);

  useEffect(() => {
    if (!stage) return;
    setLoading(true);
    guideApi
      .getGuideStageDetail(stageId)
      .then(setStageData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [stageId]);

  if (!stage) {
    navigate('/guide');
    return null;
  }

  const roles = stageData?.roles || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <motion.button
        onClick={() => navigate('/guide')}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Вернуться к карте
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left column — Storytelling */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp}>
            <StageHeader stage={stage} />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {stage.description}
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <WhyBlock text={stage.whyBlock} />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <KeyDecisions decisions={stage.keyDecisions} />
          </motion.div>
        </motion.div>

        {/* Right column — Objects */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Roles section */}
          <motion.div variants={fadeInUp} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-violet-400" />
              <h2 className="text-base font-semibold text-slate-200">Ключевые игроки</h2>
              {loading && (
                <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.length > 0
                ? roles.map((role) => (
                    <RoleCard
                      key={role.role_id}
                      roleId={role.role_id}
                      whyHere={role.why_here}
                      importance={role.importance}
                    />
                  ))
                : !loading && (
                    <p className="text-sm text-slate-600 col-span-2">
                      Информация о ролях загружается...
                    </p>
                  )}
            </div>
          </motion.div>

          {/* Artifacts section */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-violet-400" />
              <h2 className="text-base font-semibold text-slate-200">
                Артефакты
              </h2>
              <span className="text-xs text-slate-600">(Результаты труда)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {artifacts.map((artifact) => (
                <ArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

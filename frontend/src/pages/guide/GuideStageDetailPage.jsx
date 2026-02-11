import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coffee, BriefcaseBusiness } from 'lucide-react';
import OutcomeChecklist from '../../components/guide/OutcomeChecklist';
import RoleSpotlight from '../../components/guide/RoleSpotlight';
import DiscoveryStageContent from '../../components/guide/DiscoveryStageContent';
import DesignStageContent from '../../components/guide/DesignStageContent';
import BuildStageContent from '../../components/guide/BuildStageContent';
import VerifyStageContent from '../../components/guide/VerifyStageContent';
import ReleaseStageContent from '../../components/guide/ReleaseStageContent';
import { guideApi } from '../../api/guideApi';
import { getGuideStage } from '../../data/guideData';
import { STAGE_MAIN_ROLES, STAGE_OUTCOMES } from '../../data/stageDeliverables';
import { fadeInUp } from '../../utils/animations';

const STAGE_CONTENT_COMPONENTS = {
  discovery: DiscoveryStageContent,
  design: DesignStageContent,
  build: BuildStageContent,
  verify: VerifyStageContent,
  release: ReleaseStageContent,
};

function OptionalJobsBridge({ stageName }) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="text-center pt-4"
    >
      <p className="text-sm text-slate-500 mb-2">
        Интересно посмотреть реальные вакансии?
      </p>
      <button
        onClick={() => navigate(`/jobs?search=${encodeURIComponent(stageName)}`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors"
      >
        <BriefcaseBusiness className="w-3.5 h-3.5" />
        <span>Посмотреть открытые позиции</span>
      </button>
    </motion.div>
  );
}

function DefaultStageBody({ stage, stageId }) {
  const mainRole = STAGE_MAIN_ROLES[stageId] || null;
  const outcome = STAGE_OUTCOMES[stageId] || null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="text-6xl sm:text-7xl font-bold text-violet-500/20">0{stage.order}</div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">{stage.name}</h1>

        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">{stage.subtitle}</p>

        <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">{stage.description}</p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 rounded-2xl p-6 sm:p-8 border border-violet-500/20"
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Coffee size={48} className="text-violet-400 flex-shrink-0" />

          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Почему это важно?</h3>
            <p className="text-base text-slate-300 leading-relaxed">{stage.whyBlock}</p>
          </div>
        </div>
      </motion.div>

      {mainRole && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">Кто здесь главный?</h2>
          <RoleSpotlight roleId={mainRole.role_id} quote={mainRole.quote} />
        </motion.div>
      )}

      {outcome && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <OutcomeChecklist
            items={outcome.items}
            nextStageId={outcome.nextStageId}
            nextStageName={outcome.nextStageName}
          />
        </motion.div>
      )}
    </div>
  );
}

export default function GuideStageDetailPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [stageDetail, setStageDetail] = useState(null);

  const stage = getGuideStage(stageId);
  const StageStoryContent = STAGE_CONTENT_COMPONENTS[stageId];
  const recommendedStageId = searchParams.get('recommendedStageId');
  const stageQuery = recommendedStageId ? `?recommendedStageId=${recommendedStageId}` : '';
  const isRecommendedStage = recommendedStageId === stageId;

  const loadStageDetail = useCallback(async () => {
    if (!stageId) return;

    setStatus('loading');

    try {
      const detail = await guideApi.getGuideStageDetail(stageId);
      setStageDetail(detail);

      if (!detail || !detail.roles?.length) {
        setStatus('empty');
        return;
      }

      setStatus('ready');
    } catch (error) {
      setStatus('error');
      console.error(`Guide stage detail loading failed for "${stageId}"`, error);
    }
  }, [stageId]);

  useEffect(() => {
    if (!stage) return;
    loadStageDetail();
  }, [stage, loadStageDetail]);

  if (!stage) {
    navigate('/guide');
    return null;
  }

  if (status === 'loading' && !stageDetail) {
    return (
      <div className="min-h-screen pt-20 pb-8 sm:pt-24 sm:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.button
            onClick={() => navigate(`/guide${stageQuery}`)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Вернуться к карте
          </motion.button>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 text-center">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-300">Загружаем данные этапа...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 sm:pt-24 sm:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8 space-y-3">
        <motion.button
          onClick={() => navigate(`/guide${stageQuery}`)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Вернуться к карте
        </motion.button>

        {isRecommendedStage && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Рекомендованный этап
          </div>
        )}
      </div>

      {StageStoryContent ? (
        <StageStoryContent />
      ) : (
        <DefaultStageBody stage={stage} stageId={stageId} />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        <OptionalJobsBridge stageName={stage.name} />
      </div>
    </div>
  );
}

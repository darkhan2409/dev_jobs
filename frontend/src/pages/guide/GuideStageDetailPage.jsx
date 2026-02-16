import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import DiscoveryStageContent from '../../components/guide/DiscoveryStageContent';
import DesignStageContent from '../../components/guide/DesignStageContent';
import BuildStageContent from '../../components/guide/BuildStageContent';
import VerifyStageContent from '../../components/guide/VerifyStageContent';
import ReleaseStageContent from '../../components/guide/ReleaseStageContent';
import { guideApi } from '../../api/guideApi';
import { getGuideStage } from '../../data/guideData';
import { fadeInUp } from '../../utils/animations';
import { trackEvent } from '../../utils/analytics';
import { ANALYTICS_EVENTS } from '../../constants/analyticsEvents';

const STAGE_CONTENT_COMPONENTS = {
  discovery: DiscoveryStageContent,
  design: DesignStageContent,
  build: BuildStageContent,
  verify: VerifyStageContent,
  release: ReleaseStageContent,
};

function OptionalJobsBridge({ stageId, stageName, isRecommendedStage }) {
  const navigate = useNavigate();

  const handleOpenJobs = () => {
    trackEvent(ANALYTICS_EVENTS.OPTIONAL_JOBS_FROM_GUIDE_CLICK, {
      source: 'guide_stage_detail',
      stage_id: stageId,
      stage_name: stageName,
      is_recommended_stage: Boolean(isRecommendedStage),
      destination: '/jobs',
    });
    navigate(`/jobs?search=${encodeURIComponent(stageName)}`);
  };

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
        onClick={handleOpenJobs}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
      >
        <BriefcaseBusiness className="w-3.5 h-3.5" />
        <span>Посмотреть открытые позиции</span>
      </button>
    </motion.div>
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
    const timer = setTimeout(() => {
      loadStageDetail();
    }, 0);

    return () => clearTimeout(timer);
  }, [stage, loadStageDetail]);

  useEffect(() => {
    if (!stage || !stageId) return;

    trackEvent(ANALYTICS_EVENTS.GUIDE_STAGE_OPEN, {
      source: 'guide_pipeline',
      stage_id: stageId,
      stage_name: stage.name,
      recommended_stage_id: recommendedStageId || null,
      is_recommended_stage: Boolean(isRecommendedStage),
    });
  }, [stage, stageId, recommendedStageId, isRecommendedStage]);

  useEffect(() => {
    if (!stage) {
      navigate('/guide', { replace: true });
    }
  }, [stage, navigate]);

  if (!stage) {
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400">Контент для этого этапа находится в разработке.</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        <OptionalJobsBridge
          stageId={stageId}
          stageName={stage.name}
          isRecommendedStage={isRecommendedStage}
        />
      </div>
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SkillBadge from '../../components/guide/SkillBadge';
import ToolIcon from '../../components/guide/ToolIcon';
import { guideApi } from '../../api/guideApi';
import { GUIDE_ROLE_EXTRAS } from '../../data/guideData';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { cn } from '../../utils/cn';
import { trackEvent } from '../../utils/analytics';
import { ANALYTICS_EVENTS } from '../../constants/analyticsEvents';

export default function GuideRoleProfilePage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [apiWarning, setApiWarning] = useState(false);

  const extras = GUIDE_ROLE_EXTRAS[roleId];

  const loadRoleProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsEmpty(false);
    setApiWarning(false);

    try {
      const data = await guideApi.getGuideRoleProfile(roleId);

      if (!data) {
        setRoleData(null);
        setIsEmpty(true);
        return;
      }

      setRoleData(data);
      setApiWarning(Boolean(data._apiError));
    } catch (loadError) {
      setRoleData(null);
      setError('Не удалось загрузить профиль роли. Проверьте соединение и повторите попытку.');
      console.error(`Guide role profile loading failed for "${roleId}"`, loadError);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    loadRoleProfile();
  }, [loadRoleProfile]);

  if (!extras) {
    navigate('/guide');
    return null;
  }

  if (loading && !roleData) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Назад
        </motion.button>

        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/80 p-8 text-center">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-300">Загружаем профиль роли...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Назад
        </motion.button>

        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          <p className="text-sm">{error}</p>
          <button
            onClick={loadRoleProfile}
            className="mt-4 px-4 py-2 rounded-lg border border-red-400/40 bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Назад
        </motion.button>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
          <p className="text-sm">Профиль роли пока не содержит данных. Попробуйте обновить страницу позже.</p>
          <button
            onClick={loadRoleProfile}
            className="mt-4 px-4 py-2 rounded-lg border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-sm font-medium"
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  const Icon = LucideIcons[extras.icon];
  const roleName = roleData?.name || roleData?.role_id?.replace(/_/g, ' ') || roleId.replace(/_/g, ' ');
  const roleSearchQuery = encodeURIComponent(extras.searchKeywords);

  const handleOptionalJobsClick = () => {
    trackEvent(ANALYTICS_EVENTS.OPTIONAL_JOBS_FROM_GUIDE_CLICK, {
      source: 'guide_role_profile',
      role_id: roleId,
      role_name: roleName,
      destination: '/jobs',
    });
    navigate(`/jobs?search=${roleSearchQuery}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Назад
      </motion.button>

      {/* RPG Character Card */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={cn(
          'rounded-2xl overflow-hidden',
          'bg-slate-900/80 border border-slate-700/40',
          'shadow-2xl shadow-black/30'
        )}
      >
        {/* Card header with gradient */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-b from-violet-500/10 to-transparent">
          <motion.div variants={fadeInUp} className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              {Icon && <Icon size={32} className="text-violet-400" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white capitalize">{roleName}</h1>
              <p className="text-sm text-violet-400 font-medium">{extras.classTagline}</p>
            </div>
          </motion.div>
        </div>

        <div className="px-6 pb-8 space-y-8">
          {apiWarning && (
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm">
                  API-данные роли временно недоступны. Показана учебная версия профиля.
                </p>
                <button
                  onClick={loadRoleProfile}
                  className="px-3 py-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-sm font-medium"
                >
                  Повторить
                </button>
              </div>
            </motion.div>
          )}

          {/* Attributes */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Характеристики
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {extras.attributes.map((attr) => (
                <SkillBadge key={attr.name} name={attr.name} level={attr.level} />
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Суть работы
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {extras.simplifiedDescription}
            </p>
          </motion.div>

          {/* API data — responsibilities */}
          {roleData?.responsibilities && (
            <motion.div variants={fadeInUp}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Обязанности
              </h3>
              <ul className="space-y-2">
                {roleData.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-violet-400/60 mt-1">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Tools / Inventory */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Инвентарь (Инструменты)
            </h3>
            <div className="flex flex-wrap gap-2">
              {extras.tools.map((tool) => (
                <ToolIcon key={tool} name={tool} />
              ))}
            </div>
          </motion.div>

          {/* Reality Check footer */}
          <motion.div
            variants={fadeInUp}
            className={cn(
              'mt-8 p-5 rounded-xl',
              'bg-slate-800/30 border border-slate-700/30'
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-slate-300">Следующий шаг</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Когда будете готовы, можно посмотреть вакансии по этому направлению.
            </p>
            <button
              onClick={handleOptionalJobsClick}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'border border-violet-500/30 text-violet-400',
                'hover:bg-violet-500/10 hover:border-violet-500/50',
                'transition-all duration-200'
              )}
            >
              Посмотреть вакансии по направлению
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

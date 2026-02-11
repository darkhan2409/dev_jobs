import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { fadeInUp } from '../../utils/animations';
import { findGuideStageByBackendId, getGuideStage } from '../../data/guideData';

const roleNames = {
    backend_developer: 'Backend-разработчик',
    frontend_developer: 'Frontend-разработчик',
    fullstack_developer: 'Fullstack-разработчик',
    ml_engineer: 'ML-инженер',
    llm_engineer: 'LLM-инженер',
    devops_engineer: 'DevOps-инженер',
    data_engineer: 'Data-инженер',
    data_analyst: 'Аналитик данных',
    qa_engineer: 'QA-инженер',
    security_engineer: 'Инженер по безопасности',
    mobile_developer: 'Мобильный разработчик',
    game_developer: 'Разработчик игр',
    systems_architect: 'Системный архитектор',
    product_manager: 'Продакт-менеджер',
    technical_writer: 'Технический писатель',
    ui_ux_researcher: 'UI/UX-исследователь'
};

const StageResultCard = ({ stageRecommendation, rankedStages }) => {
    if (!stageRecommendation) return null;

    const {
        primary_stage_id,
        primary_stage_name,
        what_user_will_see,
        related_roles
    } = stageRecommendation;

    // Show top 3 stages
    const topStages = rankedStages?.slice(0, 3) || [];
    const mappedGuideStage = findGuideStageByBackendId(primary_stage_id) || getGuideStage(primary_stage_id);
    const recommendedStageId = mappedGuideStage?.id || null;
    const stageQuery = recommendedStageId ? `?recommendedStageId=${recommendedStageId}` : '';
    const guideStageLink = recommendedStageId ? `/guide/${recommendedStageId}${stageQuery}` : '/guide';
    const guideMapLink = recommendedStageId ? `/guide${stageQuery}` : '/guide';

    return (
        <motion.div
            variants={fadeInUp}
            className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30"
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                    <Layers className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                        Ваш этап продукта
                    </h3>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {primary_stage_name}
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-slate-300 leading-relaxed mb-6">
                {what_user_will_see}
            </p>

            {/* Related Roles */}
            {related_roles && related_roles.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <Users className="w-4 h-4" />
                        <span>Роли на этом этапе:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {related_roles.slice(0, 5).map((roleId) => (
                            <Badge key={roleId} variant="secondary" size="sm">
                                {roleNames[roleId] || roleId}
                            </Badge>
                        ))}
                        {related_roles.length > 5 && (
                            <Badge variant="ghost" size="sm">
                                +{related_roles.length - 5}
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            {/* Top Stages Progress */}
            {topStages.length > 0 && (
                <div className="mb-6 pt-4 border-t border-slate-700/50">
                    <div className="text-sm text-slate-400 mb-3">Топ-3 подходящих этапа:</div>
                    <div className="space-y-3">
                        {topStages.map(({ stage_id, stage_name, score }, index) => (
                            <div key={stage_id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className={index === 0 ? 'text-indigo-400 font-medium' : 'text-slate-400'}>
                                        {stage_name}
                                    </span>
                                    <span className="text-slate-500">{Math.round(score * 100)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score * 100}%` }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className={`h-full rounded-full ${
                                            index === 0
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                                : 'bg-slate-600'
                                        }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
                <Link to={guideStageLink}>
                    <Button variant="ghost" className="w-full justify-center">
                        Узнать больше об этапе
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
                <Link to={guideMapLink}>
                    <Button variant="outline" className="w-full justify-center">
                        Открыть карту этапов
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
};

export default StageResultCard;

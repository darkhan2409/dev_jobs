import { interviewApi } from './interviewApi';
import {
  GUIDE_STAGES,
  GUIDE_ARTIFACTS,
  GUIDE_ROLE_EXTRAS,
  getGuideStage,
  getArtifactsForStage,
  getArtifact as getArtifactStatic,
} from '../data/guideData';

export const guideApi = {
  /**
   * Получить все 5 guide-этапов (статика — без API)
   */
  getGuideStages: () => GUIDE_STAGES,

  /**
   * Получить детали guide-этапа + роли из API
   * Мержит данные из всех backend sub-stages
   */
  getGuideStageDetail: async (guideStageId) => {
    const stage = getGuideStage(guideStageId);
    if (!stage) return null;

    // Запросить детали для каждого backend sub-stage параллельно
    const detailPromises = stage.backendStageIds.map((id) =>
      interviewApi.getStageDetails(id).then((res) => res.data).catch(() => null)
    );
    const subStageDetails = (await Promise.all(detailPromises)).filter(Boolean);

    // Собрать уникальные роли из всех sub-stages
    const rolesMap = new Map();
    for (const detail of subStageDetails) {
      if (detail.roles) {
        for (const role of detail.roles) {
          if (!rolesMap.has(role.role_id)) {
            rolesMap.set(role.role_id, {
              ...role,
              extras: GUIDE_ROLE_EXTRAS[role.role_id] || null,
            });
          }
        }
      }
    }

    const artifacts = getArtifactsForStage(guideStageId);

    return {
      ...stage,
      subStages: subStageDetails,
      roles: Array.from(rolesMap.values()),
      artifacts,
    };
  },

  /**
   * Получить профиль роли (API + RPG extras)
   */
  getGuideRoleProfile: async (roleId) => {
    try {
      const response = await interviewApi.getRoleDetails(roleId);
      const apiData = response.data;
      const extras = GUIDE_ROLE_EXTRAS[roleId] || null;

      return {
        ...apiData,
        extras,
      };
    } catch {
      // Если API недоступен, вернуть только статику
      const extras = GUIDE_ROLE_EXTRAS[roleId];
      if (!extras) return null;
      return {
        role_id: roleId,
        extras,
      };
    }
  },

  /**
   * Получить артефакт (статика — без API)
   */
  getArtifact: (artifactId) => getArtifactStatic(artifactId),

  /**
   * Получить артефакты для этапа (статика — без API)
   */
  getArtifactsForStage: (guideStageId) => getArtifactsForStage(guideStageId),
};

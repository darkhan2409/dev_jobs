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

    const detailResults = await Promise.allSettled(
      stage.backendStageIds.map((id) => interviewApi.getStageDetails(id))
    );

    const subStageDetails = detailResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value.data);

    const failedStageIds = detailResults
      .map((result, index) => (result.status === 'rejected' ? stage.backendStageIds[index] : null))
      .filter(Boolean);

    if (subStageDetails.length === 0 && stage.backendStageIds.length > 0) {
      const error = new Error(`Guide stage API returned no sub-stages for "${guideStageId}"`);
      error.code = 'GUIDE_STAGE_DETAIL_EMPTY';
      error.meta = { guideStageId, failedStageIds };
      throw error;
    }

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
      apiMeta: {
        failedStageIds,
        loadedSubStages: subStageDetails.length,
        totalSubStages: stage.backendStageIds.length,
      },
    };
  },

  /**
   * Получить профиль роли (API + RPG extras)
   */
  getGuideRoleProfile: async (roleId) => {
    const extras = GUIDE_ROLE_EXTRAS[roleId] || null;

    try {
      const response = await interviewApi.getRoleDetails(roleId);
      const apiData = response.data;

      return {
        ...apiData,
        extras,
      };
    } catch (error) {
      console.error(`Failed to load role profile for "${roleId}"`, error);

      if (!extras) {
        const roleError = new Error(`Guide role profile unavailable for "${roleId}"`);
        roleError.code = 'GUIDE_ROLE_PROFILE_UNAVAILABLE';
        roleError.cause = error;
        throw roleError;
      }

      return {
        role_id: roleId,
        extras,
        _apiError: true,
        _apiErrorMessage: 'Не удалось загрузить API-данные профиля роли.',
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

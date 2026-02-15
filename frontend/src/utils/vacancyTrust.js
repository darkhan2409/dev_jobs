const SOURCE_LABELS = {
    hh: 'HeadHunter API (hh.kz)'
};

const getSourceCode = (vacancy) => {
    const source = vacancy?.source || vacancy?.raw_data?.source || 'hh';
    return String(source).toLowerCase();
};

export const getVacancySourceLabel = (vacancy) => {
    const sourceCode = getSourceCode(vacancy);
    return SOURCE_LABELS[sourceCode] || `${sourceCode.toUpperCase()} API`;
};

export const getVacancyUpdatedAt = (vacancy) =>
    vacancy?.updated_at || vacancy?.raw_data?.updated_at || vacancy?.published_at || null;

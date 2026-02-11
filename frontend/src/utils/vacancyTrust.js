const SOURCE_LABELS = {
    hh: 'HeadHunter API (hh.kz)'
};

const SOURCE_SHORT_LABELS = {
    hh: 'HH API'
};

const getSourceCode = (vacancy) => {
    const source = vacancy?.source || vacancy?.raw_data?.source || 'hh';
    return String(source).toLowerCase();
};

export const getVacancySourceLabel = (vacancy) => {
    const sourceCode = getSourceCode(vacancy);
    return SOURCE_LABELS[sourceCode] || `${sourceCode.toUpperCase()} API`;
};

export const getVacancySourceShortLabel = (vacancy) => {
    const sourceCode = getSourceCode(vacancy);
    return SOURCE_SHORT_LABELS[sourceCode] || `${sourceCode.toUpperCase()} API`;
};

export const getVacancyUpdatedAt = (vacancy) =>
    vacancy?.updated_at || vacancy?.raw_data?.updated_at || vacancy?.published_at || null;

export const formatVacancyUpdatedAt = (vacancy, { short = false } = {}) => {
    const updatedAt = getVacancyUpdatedAt(vacancy);
    if (!updatedAt) return short ? '—' : 'дата не указана';

    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return short ? '—' : 'дата не указана';

    const formatter = short
        ? new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        : new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    return formatter.format(date);
};

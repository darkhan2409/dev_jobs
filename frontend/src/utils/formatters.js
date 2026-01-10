export const formatSalary = (salaryFrom, salaryTo, currency) => {
    if (!salaryFrom && !salaryTo) return "По договоренности";

    const formatNum = (num) => new Intl.NumberFormat('ru-RU').format(num);
    const curr = currency === 'KZT' ? '₸' : '$';

    if (salaryFrom && salaryTo) {
        return `${formatNum(salaryFrom)} - ${formatNum(salaryTo)} ${curr}`;
    }
    if (salaryFrom) {
        return `от ${formatNum(salaryFrom)} ${curr}`;
    }
    if (salaryTo) {
        return `до ${formatNum(salaryTo)} ${curr}`;
    }
    return "По договоренности";
};

export const formatCurrency = formatSalary;

export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

export const sanitizeHtml = (html) => {
    if (!html) return '';
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return String(html);
    }

    const template = document.createElement('template');
    template.innerHTML = String(html);

    // Remove dangerous tags completely.
    const blockedTags = [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'link',
        'meta',
        'base',
        'form',
    ];
    blockedTags.forEach((tag) => {
        template.content.querySelectorAll(tag).forEach((node) => node.remove());
    });

    // Remove inline handlers and javascript: URLs.
    template.content.querySelectorAll('*').forEach((el) => {
        [...el.attributes].forEach((attr) => {
            const name = attr.name.toLowerCase();
            const value = attr.value.trim().toLowerCase();

            if (name.startsWith('on')) {
                el.removeAttribute(attr.name);
                return;
            }

            if (name === 'href' || name === 'src' || name === 'xlink:href') {
                if (
                    value.startsWith('javascript:') ||
                    value.startsWith('vbscript:') ||
                    value.startsWith('data:text/html')
                ) {
                    el.removeAttribute(attr.name);
                }
            }
        });
    });

    return template.innerHTML;
};

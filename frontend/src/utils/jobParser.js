import DOMPurify from 'dompurify';

export const parseJobDescription = (htmlContent) => {
    if (!htmlContent) return [];

    const cleanHtml = DOMPurify.sanitize(htmlContent);
    const sections = [];

    // 1. Convert HTML to a temporary DOM element for easier parsing
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;

    // Helper: Identify section type by keyword
    const identifySectionType = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('start') || lower.includes('about') || lower.includes('описание') || lower.includes('задачи')) return 'overview';
        if (lower.includes('responsibilities') || lower.includes('duties') || lower.includes('обязанности') || lower.includes('чем предстоит заниматься')) return 'responsibilities';
        if (lower.includes('requirements') || lower.includes('skills') || lower.includes('требования') || lower.includes('ждем от вас')) return 'requirements';
        if (lower.includes('conditions') || lower.includes('benefits') || lower.includes('offer') || lower.includes('условия') || lower.includes('мы предлагаем')) return 'conditions';
        return 'other';
    };

    // Strategy A: Header-based splitting (Strong signals: h1-h4, strong tags with colons)
    const headers = tempDiv.querySelectorAll('h1, h2, h3, h4, strong');
    let currentSection = { id: 'overview', title: 'Обзор вакансии', content: '', type: 'overview' };

    // Initial content before any header
    let contentAccumulator = [];

    // Check if we have clear headers
    const significantHeaders = Array.from(headers).filter(h => {
        const text = h.innerText.trim();
        // Filter out short "headers" that are likely just bold words in text
        return text.length > 3 && text.length < 100 && identifySectionType(text) !== 'other';
    });

    if (significantHeaders.length > 0) {
        // --- Strategy A Implementation ---

        // Process nodes linearly
        Array.from(tempDiv.childNodes).forEach(node => {
            const nodeText = node.textContent?.trim() || "";
            const isHeader = ['H1', 'H2', 'H3', 'H4'].includes(node.nodeName) ||
                (node.nodeName === 'STRONG' && identifySectionType(nodeText) !== 'other');

            if (isHeader) {
                // Save previous section if not empty
                if (contentAccumulator.length > 0 || currentSection.content) {
                    currentSection.content += contentAccumulator.map(n => n.outerHTML || n.textContent).join('');
                    sections.push(currentSection);
                    contentAccumulator = [];
                }

                // Start new section
                const type = identifySectionType(nodeText);
                currentSection = {
                    id: type + '-' + Math.random().toString(36).substr(2, 5),
                    title: nodeText.replace(/[:.]\s*$/, ''), // Remove trailing colon
                    content: '',
                    type: type
                };
            } else {
                contentAccumulator.push(node);
            }
        });

        // Push final section
        if (contentAccumulator.length > 0) {
            currentSection.content += contentAccumulator.map(n => n.outerHTML || n.textContent).join('');
            sections.push(currentSection);
        }

    } else {
        // --- Strategy B: Fallback / Best Guess ---
        // If no headers found, try to chunk simply by paragraphs or list proximity

        const children = Array.from(tempDiv.children); // Get top-level elements

        if (children.length === 0) {
            // Just text?
            sections.push({ id: 'overview', title: 'Описание', content: tempDiv.innerHTML, type: 'overview' });
        } else {
            // Heuristic: Split into 3 parts if long enough
            const totalNodes = children.length;

            if (totalNodes <= 3) {
                // Too short to split
                sections.push({ id: 'overview', title: 'Описание вакансии', content: tempDiv.innerHTML, type: 'overview' });
            } else {
                // Force split: 
                // Part 1: Overview (First 20-30%)
                // Part 2: Responsibilities/Requirements (Middle 40-50%)
                // Part 3: Conditions (Last 20-30%)

                const part1End = Math.floor(totalNodes * 0.3);
                const part2End = Math.floor(totalNodes * 0.7);

                // Overview
                const overviewContent = children.slice(0, part1End).map(n => n.outerHTML).join('');
                sections.push({ id: 'overview', title: 'О проекте', content: overviewContent, type: 'overview' });

                // Core (Tasks/Reqs)
                const coreContent = children.slice(part1End, part2End).map(n => n.outerHTML).join('');
                sections.push({ id: 'core', title: 'Задачи и Требования', content: coreContent, type: 'responsibilities' });

                // Footer (Conditions)
                const footerContent = children.slice(part2End).map(n => n.outerHTML).join('');
                sections.push({ id: 'conditions', title: 'Условия', content: footerContent, type: 'conditions' });
            }
        }
    }

    // Post-processing: Filter out empty sections
    return sections.filter(s => s.content && s.content.replace(/<[^>]*>/g, '').trim().length > 10);
};

import React from 'react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const JobDescription = ({ htmlContent }) => {
    const safeHtml = React.useMemo(() => sanitizeHtml(htmlContent), [htmlContent]);

    return (
        <div className="w-full overflow-x-hidden bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-gray-300 shadow-xl shadow-black/20">
            <div
                className="
                    text-base leading-relaxed text-slate-300

                    /* Spacing for Paragraphs */
                    [&_p]:mb-4

                    /* List Styles - kept neat but less aggressive */
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6 [&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6 [&_ol]:space-y-2
                    [&_li]:pl-1 [&_li::marker]:text-violet-500

                    /* Bold Text - INLINE emphasis, not block headers */
                    [&_strong]:text-white [&_strong]:font-semibold
                    [&_b]:text-white [&_b]:font-semibold

                    /* Real Headers - Distinct styles */
                    [&_h1]:text-white [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:mt-8 [&_h1]:mb-4
                    [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-4
                    [&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-3

                    /* Links */
                    [&_a]:text-violet-400 [&_a]:underline hover:[&_a]:text-violet-300 [&_a]:transition-colors

                    /* Mobile overflow fixes for HH.ru content */
                    [&_img]:max-w-full [&_img]:h-auto
                    [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full
                    [&_pre]:overflow-x-auto [&_pre]:max-w-full

                    /* Selection */
                    selection:bg-violet-500/30 selection:text-white
                "
                dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
        </div>
    );
};

export default JobDescription;

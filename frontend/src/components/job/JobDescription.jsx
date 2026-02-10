import React from 'react';

const JobDescription = ({ htmlContent }) => {
    return (
        <div
            className="max-w-4xl mx-auto w-full bg-[#1F2833]/50 border border-white/5 shadow-[0_0_0_1px_rgba(168,85,247,0.08)] rounded-2xl p-6 md:p-8 text-gray-300"
        >
            <div
                className="
                    [&_p]:mb-4 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2
                    [&_li]:leading-relaxed
                    [&_strong]:text-white [&_strong]:font-semibold
                    [&_b]:text-white [&_b]:font-semibold
                    [&_h1]:text-white [&_h1]:font-semibold
                    [&_h2]:text-white [&_h2]:font-semibold
                    [&_h3]:text-white [&_h3]:font-semibold
                    [&_h4]:text-white [&_h4]:font-semibold
                    [&_a]:text-violet-400 [&_a:hover]:text-violet-300
                "
                dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
            />
        </div>
    );
};

export default JobDescription;

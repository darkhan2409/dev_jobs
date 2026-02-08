import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordRequirements = ({ password }) => {
    const requirements = [
        {
            label: 'Минимум 6 букв',
            test: (p) => (p.match(/[a-zA-Z]/g) || []).length >= 6
        },
        {
            label: 'Хотя бы одна цифра (0-9)',
            test: (p) => /\d/.test(p)
        }
    ];

    if (!password) return null;

    return (
        <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium">Требования к паролю:</p>
            <ul className="space-y-1.5">
                {requirements.map((req, idx) => {
                    const isValid = req.test(password);
                    return (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                            <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isValid
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-slate-700 text-slate-500'
                                }`}>
                                {isValid ? <Check size={10} /> : <X size={10} />}
                            </span>
                            <span className={isValid ? 'text-slate-300' : 'text-slate-500'}>
                                {req.label}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PasswordRequirements;

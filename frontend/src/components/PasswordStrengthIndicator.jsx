import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
    const calculateStrength = () => {
        if (!password) return 0;

        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 10;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/\d/.test(password)) strength += 15;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

        return strength;
    };

    const strength = calculateStrength();

    const getColor = () => {
        if (strength < 40) return 'bg-red-500';
        if (strength < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getLabel = () => {
        if (strength < 40) return 'Слабый';
        if (strength < 70) return 'Средний';
        return 'Надёжный';
    };

    if (!password) return null;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getColor()}`}
                        style={{ width: `${strength}%` }}
                    />
                </div>
                <span className={`text-xs font-medium ${
                    strength < 40 ? 'text-red-400' :
                    strength < 70 ? 'text-yellow-400' :
                    'text-green-400'
                }`}>
                    {getLabel()}
                </span>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;

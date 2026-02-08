import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = type === 'success'
        ? 'bg-green-500/90'
        : type === 'error'
            ? 'bg-red-500/90'
            : 'bg-blue-500/90';

    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 ${bgColor} backdrop-blur-sm text-white rounded-xl shadow-2xl border border-white/10 max-w-md`}
        >
            <Icon size={24} className="flex-shrink-0" />
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <AnimatePresence>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </AnimatePresence>
    );
};

export default Toast;

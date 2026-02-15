import { motion } from 'framer-motion';
import { signalNames } from '../../constants/signalNames';

const SignalChart = ({ signalProfile }) => {
    const signals = Object.entries(signalProfile)
        .map(([id, count]) => ({
            id,
            name: signalNames[id] || id,
            count
        }))
        .filter(s => s.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    const maxCount = Math.max(...signals.map(s => s.count), 1);

    if (signals.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">
                Ваш когнитивный профиль
            </h3>
            <div className="space-y-3">
                {signals.map((signal, index) => (
                    <div key={signal.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">{signal.name}</span>
                            <span className="text-slate-500">{signal.count}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(signal.count / maxCount) * 100}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SignalChart;

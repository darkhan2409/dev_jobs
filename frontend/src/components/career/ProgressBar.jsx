import { motion } from 'framer-motion';
import Badge from '../ui/Badge';

const ProgressBar = ({ current, total, thematicBlock }) => {
    const progress = ((current + 1) / total) * 100;

    const blockNames = {
        problem_solving: 'Решение проблем',
        work_style: 'Стиль работы',
        learning: 'Обучение',
        collaboration: 'Командная работа',
        technical_preferences: 'Технические предпочтения',
        career_goals: 'Карьерные цели'
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Badge variant="primary">
                    {blockNames[thematicBlock] || thematicBlock}
                </Badge>
                <span className="text-sm text-slate-400">
                    {current + 1} из {total}
                </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;

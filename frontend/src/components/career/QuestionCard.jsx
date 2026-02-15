import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from './ProgressBar';

const QuestionCard = ({
    question,
    currentIndex,
    totalQuestions,
    selectedAnswer,
    onAnswer,
    onPrev,
    onNext,
    isSubmitting
}) => {
    const canGoBack = currentIndex > 0;
    const canGoForward = selectedAnswer !== null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
        >
            <ProgressBar
                current={currentIndex}
                total={totalQuestions}
                thematicBlock={question.thematic_block}
            />

            <div className="mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h2 className="text-xl md:text-2xl font-medium text-white mb-8">
                            {question.text}
                        </h2>

                        <div className="space-y-3">
                            {question.answer_options.map((option, index) => (
                                <motion.button
                                    key={option.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => onAnswer(option.id)}
                                    disabled={isSubmitting}
                                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${selectedAnswer === option.id
                                            ? 'border-violet-500 bg-violet-500/10 text-white'
                                            : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm ${selectedAnswer === option.id
                                                ? 'border-violet-500 bg-violet-500 text-white'
                                                : 'border-slate-600 text-slate-500'
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="flex-1">{option.text}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex justify-between mt-8">
                <Button
                    variant="ghost"
                    onClick={onPrev}
                    disabled={!canGoBack || isSubmitting}
                    className={!canGoBack ? 'invisible' : ''}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Назад
                </Button>

                {currentIndex < totalQuestions - 1 ? (
                    <Button
                        variant="primary"
                        onClick={onNext}
                        disabled={!canGoForward || isSubmitting}
                    >
                        Далее
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={onNext}
                        disabled={!canGoForward || isSubmitting}
                    >
                        {isSubmitting ? 'Обработка...' : 'Завершить тест'}
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default QuestionCard;

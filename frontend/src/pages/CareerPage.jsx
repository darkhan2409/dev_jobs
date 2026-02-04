import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { interviewApi } from '../api/interviewApi';
import WelcomeScreen from '../components/career/WelcomeScreen';
import QuestionCard from '../components/career/QuestionCard';
import ResultsScreen from '../components/career/ResultsScreen';
import { pageVariants } from '../utils/animations';

const CareerPage = () => {
    const [screen, setScreen] = useState('welcome'); // 'welcome' | 'test' | 'results'
    const [sessionId, setSessionId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Record<questionId, answerOptionId>
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleStart = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [questionsRes, sessionRes] = await Promise.all([
                interviewApi.getQuestions(),
                interviewApi.startTest()
            ]);
            setQuestions(questionsRes.data);
            setSessionId(sessionRes.data.session_id);
            setScreen('test');
        } catch (err) {
            setError('Не удалось начать тест. Попробуйте позже.');
            console.error('Start test error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnswer = useCallback((answerOptionId) => {
        const currentQuestion = questions[currentIndex];
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: answerOptionId
        }));
    }, [questions, currentIndex]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleNext = useCallback(async () => {
        const currentQuestion = questions[currentIndex];
        const selectedAnswerId = answers[currentQuestion.id];

        if (!selectedAnswerId) return;

        setIsSubmitting(true);
        try {
            await interviewApi.submitAnswer(sessionId, currentQuestion.id, selectedAnswerId);

            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Last question - complete the test
                const completeRes = await interviewApi.completeTest(sessionId);
                setResults(completeRes.data);
                setScreen('results');
            }
        } catch (err) {
            setError('Ошибка при отправке ответа. Попробуйте ещё раз.');
            console.error('Submit answer error:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [questions, currentIndex, answers, sessionId]);

    const handleRestart = useCallback(() => {
        setScreen('welcome');
        setSessionId(null);
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers({});
        setResults(null);
        setError(null);
    }, []);

    return (
        <motion.div
            className="min-h-screen py-16 px-4"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-7xl mx-auto">
                {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
                        {error}
                    </div>
                )}

                {screen === 'welcome' && (
                    <WelcomeScreen onStart={handleStart} isLoading={isLoading} />
                )}

                {screen === 'test' && questions.length > 0 && (
                    <QuestionCard
                        question={questions[currentIndex]}
                        currentIndex={currentIndex}
                        totalQuestions={questions.length}
                        selectedAnswer={answers[questions[currentIndex].id] || null}
                        onAnswer={handleAnswer}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        isSubmitting={isSubmitting}
                    />
                )}

                {screen === 'results' && results && (
                    <ResultsScreen results={results} onRestart={handleRestart} />
                )}
            </div>
        </motion.div>
    );
};

export default CareerPage;

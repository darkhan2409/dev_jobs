import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { interviewApi } from '../api/interviewApi';
import WelcomeScreen from '../components/career/WelcomeScreen';
import QuestionCard from '../components/career/QuestionCard';
import ResultsScreen from '../components/career/ResultsScreen';
import ErrorState from '../components/ui/ErrorState';
import { pageVariants } from '../utils/animations';
import { trackEvent } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';

const CareerPage = () => {
    const [screen, setScreen] = useState('welcome'); // 'welcome' | 'test' | 'results'
    const [sessionId, setSessionId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // Record<questionId, answerOptionId>
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorState, setErrorState] = useState(null);

    const completeTestRequest = useCallback(async () => {
        const completeRes = await interviewApi.completeTest(sessionId);
        const resultData = completeRes.data;

        trackEvent(ANALYTICS_EVENTS.CAREER_TEST_COMPLETE, {
            source: 'career_page',
            session_id: sessionId,
            ranked_roles_count: resultData?.ranked_roles?.length || 0,
            primary_role_id: resultData?.ranked_roles?.[0]?.role_id || null,
            primary_stage_id: resultData?.stage_recommendation?.primary_stage_id || null,
        });

        setResults(completeRes.data);
        setScreen('results');
    }, [sessionId]);

    const handleStart = useCallback(async () => {
        setIsLoading(true);
        setErrorState(null);
        try {
            const [questionsRes, sessionRes] = await Promise.all([
                interviewApi.getQuestions(),
                interviewApi.startTest()
            ]);

            trackEvent(ANALYTICS_EVENTS.CAREER_TEST_START, {
                source: 'career_page',
                session_id: sessionRes.data.session_id,
                questions_count: Array.isArray(questionsRes.data) ? questionsRes.data.length : 0,
            });

            setQuestions(questionsRes.data);
            setSessionId(sessionRes.data.session_id);
            setScreen('test');
        } catch (err) {
            setErrorState({
                title: 'Не удалось начать тест',
                message: 'Сервис временно недоступен. Проверьте соединение и повторите запуск.',
                retryAction: 'start'
            });
            console.error('Start test error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnswer = useCallback((answerOptionId) => {
        const currentQuestion = questions[currentIndex];
        if (!currentQuestion) return;

        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: answerOptionId
        }));
        if (errorState?.retryAction === 'submit') {
            setErrorState(null);
        }
    }, [questions, currentIndex, errorState]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
        if (errorState) {
            setErrorState(null);
        }
    }, [currentIndex, errorState]);

    const handleNext = useCallback(async () => {
        const currentQuestion = questions[currentIndex];
        if (!currentQuestion) {
            setErrorState({
                title: 'Test state error',
                message: 'Current question is unavailable. Please restart the test.',
                retryAction: 'restart'
            });
            return;
        }

        const selectedAnswerId = answers[currentQuestion.id];

        if (!selectedAnswerId) return;

        setErrorState(null);
        setIsSubmitting(true);
        if (currentIndex < questions.length - 1) {
            try {
                await interviewApi.submitAnswer(sessionId, currentQuestion.id, selectedAnswerId);
                setCurrentIndex(prev => prev + 1);
            } catch (err) {
                setErrorState({
                    title: 'Не удалось отправить ответ',
                    message: 'Проверьте соединение и повторите отправку текущего ответа.',
                    retryAction: 'submit'
                });
                console.error('Submit answer error:', err);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        try {
            await interviewApi.submitAnswer(sessionId, currentQuestion.id, selectedAnswerId);
        } catch (err) {
            setErrorState({
                title: 'Не удалось отправить финальный ответ',
                message: 'Последний ответ не отправлен. Повторите попытку.',
                retryAction: 'submit'
            });
            console.error('Final submit answer error:', err);
            setIsSubmitting(false);
            return;
        }

        try {
            await completeTestRequest();
        } catch (err) {
            setErrorState({
                title: 'Не удалось загрузить результаты',
                message: 'Ответы сохранены, но результаты не загрузились. Повторите попытку.',
                retryAction: 'complete'
            });
            console.error('Complete test error:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, completeTestRequest, currentIndex, questions, sessionId]);

    const handleRetryError = useCallback(async () => {
        if (!errorState?.retryAction) return;

        if (errorState.retryAction === 'start') {
            handleStart();
            return;
        }

        if (errorState.retryAction === 'submit') {
            handleNext();
            return;
        }

        if (errorState.retryAction === 'complete') {
            setErrorState(null);
            setIsSubmitting(true);
            try {
                await completeTestRequest();
            } catch (err) {
                setErrorState({
                    title: 'Не удалось загрузить результаты',
                    message: 'Сервис временно недоступен. Повторите попытку через несколько секунд.',
                    retryAction: 'complete'
                });
                console.error('Retry complete test error:', err);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (errorState.retryAction === 'restart') {
            setScreen('welcome');
            setSessionId(null);
            setQuestions([]);
            setCurrentIndex(0);
            setAnswers({});
            setResults(null);
            setErrorState(null);
        }
    }, [completeTestRequest, errorState, handleNext, handleStart]);

    const handleRestart = useCallback(() => {
        setScreen('welcome');
        setSessionId(null);
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers({});
        setResults(null);
        setErrorState(null);
    }, []);

    useEffect(() => {
        if (screen !== 'test') return undefined;

        const warningMessage = 'Если уйти со страницы, прогресс карьерного теста будет потерян. Продолжить?';

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = warningMessage;
            return warningMessage;
        };

        const handlePopState = (event) => {
            const shouldLeave = window.confirm(warningMessage);
            if (!shouldLeave) {
                event.preventDefault();
                window.history.pushState({ career_test_guard: true }, '', window.location.href);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.history.pushState({ career_test_guard: true }, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [screen]);

    const currentQuestion = questions[currentIndex] || null;

    return (
        <motion.div
            className={`min-h-screen px-4 ${screen === 'results' ? 'pt-16 sm:pt-24 pb-4 sm:pb-8' : 'py-16 sm:py-24'}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-7xl mx-auto">
                {errorState && (
                    <ErrorState
                        title={errorState.title}
                        message={errorState.message}
                        onRetry={handleRetryError}
                        showHomeLink={screen === 'welcome'}
                        className="py-8"
                    />
                )}

                {screen === 'welcome' && (
                    <WelcomeScreen onStart={handleStart} isLoading={isLoading} />
                )}

                {screen === 'test' && currentQuestion && (
                    <QuestionCard
                        question={currentQuestion}
                        currentIndex={currentIndex}
                        totalQuestions={questions.length}
                        selectedAnswer={answers[currentQuestion.id] || null}
                        onAnswer={handleAnswer}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        isSubmitting={isSubmitting}
                    />
                )}

                {screen === 'test' && !currentQuestion && questions.length > 0 && (
                    <ErrorState
                        title="Test state error"
                        message="Question pointer is out of range. Restart the test to continue."
                        onRetry={handleRestart}
                        showHomeLink={false}
                        className="py-8"
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

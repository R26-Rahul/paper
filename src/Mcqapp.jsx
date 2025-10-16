import React, { useState, useEffect } from 'react';
import './McqApp.css';
import quizData from './questions.json';

const McqApp = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [userName, setUserName] = useState('');
    const [showNameInput, setShowNameInput] = useState(true);
    const [attempts, setAttempts] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // Load attempts from localStorage on component mount
    useEffect(() => {
        const savedAttempts = localStorage.getItem('quizAttempts');
        if (savedAttempts) {
            setAttempts(JSON.parse(savedAttempts));
        }
    }, []);

    // Initialize quiz
    useEffect(() => {
        if (quizData.questions) {
            setQuestions(quizData.questions);
            setTimeLeft(quizData.questions[0]?.timeLimit || 30);
        }
    }, []);

    // Timer effect
    useEffect(() => {
        if (quizStarted && timerActive && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (quizStarted && timerActive && timeLeft === 0) {
            handleTimeUp();
        }
    }, [timeLeft, timerActive, quizStarted]);

    // Reset timer when question changes
    useEffect(() => {
        if (questions.length > 0 && currentQuestion < questions.length) {
            setTimeLeft(questions[currentQuestion].timeLimit);
            setTimerActive(true);
            setAnswered(false);
            setSelectedAnswer(null);
        }
    }, [currentQuestion, questions]);

    const handleTimeUp = () => {
        setTimerActive(false);
        setAnswered(true);
        setSelectedAnswer(-1);
    };

    const handleAnswerSelect = (optionIndex) => {
        if (answered || !timerActive) return;

        setSelectedAnswer(optionIndex);
        setAnswered(true);
        setTimerActive(false);

        if (optionIndex === questions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            saveAttempt();
            setShowScore(true);
        }
    };

    const saveAttempt = () => {
        const newAttempt = {
            id: Date.now(),
            userName: userName || 'Anonymous',
            score: score,
            totalQuestions: questions.length,
            percentage: Math.round((score / questions.length) * 100),
            date: new Date().toLocaleString(),
            difficultyBreakdown: calculateDifficultyBreakdown()
        };

        const updatedAttempts = [newAttempt, ...attempts].slice(0, 10); // Keep last 10 attempts
        setAttempts(updatedAttempts);
        localStorage.setItem('quizAttempts', JSON.stringify(updatedAttempts));
    };

    const calculateDifficultyBreakdown = () => {
        const breakdown = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        };

        questions.forEach((question, index) => {
            breakdown[question.difficulty].total++;
            // This is simplified - you'd need to track which specific questions were answered correctly
        });

        return breakdown;
    };

    const handleRestartQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswer(null);
        setAnswered(false);
        setTimerActive(true);
        setShowNameInput(true);
        setUserName('');
        setTimeLeft(questions[0]?.timeLimit || 30);
    };

    const startQuiz = () => {
        if (userName.trim()) {
            setQuizStarted(true);
            setShowNameInput(false);
        } else {
            alert('Please enter your name to start the quiz!');
        }
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        startQuiz();
    };

    const getOptionClass = (optionIndex) => {
        if (!answered) return "option";

        if (optionIndex === questions[currentQuestion].correctAnswer) {
            return "option correct";
        } else if (optionIndex === selectedAnswer && optionIndex !== questions[currentQuestion].correctAnswer) {
            return "option incorrect";
        }
        return "option";
    };

    const getTimerColor = () => {
        if (questions.length === 0) return "#667eea";
        const percentage = (timeLeft / questions[currentQuestion].timeLimit) * 100;
        if (percentage > 50) return "#4caf50";
        if (percentage > 25) return "#ff9800";
        return "#f44336";
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return '#4caf50';
            case 'medium': return '#ff9800';
            case 'hard': return '#f44336';
            default: return '#667eea';
        }
    };

    const clearHistory = () => {
        setAttempts([]);
        localStorage.removeItem('quizAttempts');
    };

    if (questions.length === 0) {
        return (
            <div className="mcq-container">
                <div className="mcq-card">
                    <div className="loading">Loading questions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mcq-container">
            <div className="mcq-card">
                <header className="mcq-header">
                    <h1>{quizData.quizTitle}</h1>
                    {!quizStarted && !showNameInput && (
                        <div className="quiz-info">
                            <p>Total Questions: {questions.length}</p>
                            <p>Time Limit: Varies per question</p>
                        </div>
                    )}
                </header>

                {showNameInput && !quizStarted ? (
                    <div className="name-input-section">
                        <div className="welcome-message">
                            <p>Enter your name to begin your journey</p>
                        </div>
                        <form onSubmit={handleNameSubmit} className="name-form">
                            <div className="input-group">

                                <input
                                    type="text"
                                    placeholder="Enter your name..."
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="name-input"
                                    maxLength={50}
                                    autoFocus
                                />

                                <div className="input-underline"></div>
                            </div>
                            <button type="submit" className="start-btn">
                                Start Exam 🚀
                            </button>
                        </form>

                        {attempts.length > 0 && (
                            <div className="quick-stats">
                                <h3>Recent Performance</h3>
                                <div className="recent-attempt">
                                    <span>Last attempt: </span>
                                    <strong>{attempts[0].userName}</strong> - {attempts[0].score}/{attempts[0].totalQuestions} ({attempts[0].percentage}%)
                                </div>
                                <button
                                    className="view-results-btn"
                                    onClick={() => setShowResults(true)}
                                >
                                    View All Results
                                </button>
                            </div>
                        )}
                    </div>
                ) : !quizStarted ? (
                    <div className="start-section">
                        <div className="user-welcome">
                            <h2>Hello, {userName}! 👋</h2>
                            <p>Get ready to test your knowledge</p>
                        </div>
                        <div className="quiz-stats">
                            <div className="stat">
                                <span className="stat-number">{questions.length}</span>
                                <span className="stat-label">Questions</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">
                                    {questions.filter(q => q.difficulty === 'easy').length}
                                </span>
                                <span className="stat-label">Easy</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">
                                    {questions.filter(q => q.difficulty === 'medium').length}
                                </span>
                                <span className="stat-label">Medium</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">
                                    {questions.filter(q => q.difficulty === 'hard').length}
                                </span>
                                <span className="stat-label">Hard</span>
                            </div>
                        </div>
                        <button className="start-btn" onClick={startQuiz}>
                            Start Now
                        </button>
                    </div>
                ) : showResults ? (
                    <div className="results-section">
                        <div className="results-header">
                            <h2>Exam Results History</h2>
                            <button
                                className="back-btn"
                                onClick={() => setShowResults(false)}
                            >
                                ← Back to Exam
                            </button>
                        </div>

                        {attempts.length === 0 ? (
                            <div className="no-results">
                                <div className="no-results-icon">📊</div>
                                <h3>No attempts yet</h3>
                                <p>Complete a exam to see your results here!</p>
                            </div>
                        ) : (
                            <>
                                <div className="results-stats">
                                    <div className="result-stat">
                                        <span className="result-stat-number">{attempts.length}</span>
                                        <span className="result-stat-label">Total Attempts</span>
                                    </div>
                                    <div className="result-stat">
                                        <span className="result-stat-number">
                                            {Math.max(...attempts.map(a => a.score))}
                                        </span>
                                        <span className="result-stat-label">Best Score</span>
                                    </div>
                                    <div className="result-stat">
                                        <span className="result-stat-number">
                                            {Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length)}%
                                        </span>
                                        <span className="result-stat-label">Average</span>
                                    </div>
                                </div>

                                <div className="attempts-list">
                                    <h3>Recent Attempts</h3>
                                    {attempts.map((attempt, index) => (
                                        <div key={attempt.id} className="attempt-item">
                                            <div className="attempt-header">
                                                <div className="attempt-user">{attempt.userName}</div>
                                                <div className="attempt-date">{attempt.date}</div>
                                            </div>
                                            <div className="attempt-score">
                                                <div className="score-circle-small">
                                                    <span className="score-text">{attempt.score}/{attempt.totalQuestions}</span>
                                                    <span className="score-percentage">{attempt.percentage}%</span>
                                                </div>
                                                <div className="attempt-performance">
                                                    <div
                                                        className="performance-bar"
                                                        style={{ '--score-percent': `${attempt.percentage}%` }}
                                                    >
                                                        <div className="performance-fill"></div>
                                                    </div>
                                                    <div className="performance-message">
                                                        {attempt.percentage === 100 ? "🎉 Perfect!" :
                                                            attempt.percentage >= 80 ? "👍 Excellent!" :
                                                                attempt.percentage >= 60 ? "😊 Good!" :
                                                                    attempt.percentage >= 40 ? "📚 Keep Learning!" :
                                                                        "💪 Practice More!"}
                                                    </div>
                                                </div>
                                            </div>
                                            {index === 0 && <div className="latest-badge">Latest</div>}
                                        </div>
                                    ))}
                                </div>

                                <button className="clear-history-btn" onClick={clearHistory}>
                                    Clear History
                                </button>
                            </>
                        )}
                    </div>
                ) : showScore ? (
                    <div className="score-section">
                        <h2>Quiz Completed, {userName}! 🎉</h2>
                        <div className="score-circle">
                            <span className="score-text">
                                {score} / {questions.length}
                            </span>
                            <span className="score-percentage">
                                {Math.round((score / questions.length) * 100)}%
                            </span>
                        </div>
                        <div className="score-details">
                            <div className="score-breakdown">
                                <h3>Performance Summary</h3>
                                <div className="breakdown-item">
                                    <span>Correct Answers:</span>
                                    <span>{score} out of {questions.length}</span>
                                </div>
                                <div className="breakdown-item">
                                    <span>Success Rate:</span>
                                    <span>{Math.round((score / questions.length) * 100)}%</span>
                                </div>
                                <div className="breakdown-item">
                                    <span>Date Completed:</span>
                                    <span>{new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <p className="score-message">
                            {score === questions.length ? "🎉 Perfect! You're a quiz master!" :
                                score >= questions.length * 0.8 ? "👍 Excellent! Outstanding performance!" :
                                    score >= questions.length * 0.6 ? "😊 Good job! Solid understanding!" :
                                        score >= questions.length * 0.4 ? "📚 Not bad! Keep learning!" :
                                            "💪 Keep practicing! You'll improve!"}
                        </p>
                        <div className="score-actions">
                            <button className="restart-btn" onClick={handleRestartQuiz}>
                                Try Again
                            </button>
                            <button
                                className="view-results-btn"
                                onClick={() => setShowResults(true)}
                            >
                                View Results History
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="question-section">
                        <div className="question-header">
                            <div className="progress">
                                Question {currentQuestion + 1} of {questions.length}
                            </div>
                            <div className="user-info">Playing as: {userName}</div>
                            <div
                                className="difficulty-badge"
                                style={{ backgroundColor: getDifficultyColor(questions[currentQuestion].difficulty) }}
                            >
                                {questions[currentQuestion].difficulty}
                            </div>
                        </div>

                        <div className="timer-container">
                            <div className="timer-text">Time Remaining:</div>
                            <div
                                className="timer-circle"
                                style={{
                                    '--timer-color': getTimerColor(),
                                    '--timer-progress': `${(timeLeft / questions[currentQuestion].timeLimit) * 100}%`
                                }}
                            >
                                <span className="timer-count">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="question-text">
                            {questions[currentQuestion].question}
                        </div>

                        <div className="options-container">
                            {questions[currentQuestion].options.map((option, index) => (
                                <button
                                    key={index}
                                    className={getOptionClass(index)}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={answered || !timerActive}
                                >
                                    <span className="option-letter">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    {option}
                                </button>
                            ))}
                        </div>

                        {answered && (
                            <div className="feedback">
                                {selectedAnswer === questions[currentQuestion].correctAnswer ? (
                                    <div className="feedback-correct">
                                        ✅ Correct! Well done!
                                    </div>
                                ) : selectedAnswer === -1 ? (
                                    <div className="feedback-incorrect">
                                        ⏰ Time's up! The correct answer is:{" "}
                                        <strong>{questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}</strong>
                                    </div>
                                ) : (
                                    <div className="feedback-incorrect">
                                        ❌ Incorrect. The correct answer is:{" "}
                                        <strong>{questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}</strong>
                                    </div>
                                )}

                                <button className="next-btn" onClick={handleNextQuestion}>
                                    {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default McqApp;
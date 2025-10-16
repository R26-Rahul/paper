import React, { useState, useEffect } from 'react';
import './mcq.css';
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
      setShowScore(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setTimerActive(true);
    setQuizStarted(true);
    setTimeLeft(questions[0]?.timeLimit || 30);
  };

  const startQuiz = () => {
    setQuizStarted(true);
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
          {!quizStarted && (
            <div className="quiz-info">
              <p>Total Questions: {questions.length}</p>
              <p>Time Limit: Varies per question</p>
            </div>
          )}
        </header>

        {!quizStarted ? (
          <div className="start-section">
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
              Start Quiz
            </button>
          </div>
        ) : showScore ? (
          <div className="score-section">
            <h2>Quiz Completed!</h2>
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
                <h3>Performance Breakdown</h3>
                <div className="breakdown-item">
                  <span>Easy Questions:</span>
                  <span>
                    {score} correct out of {questions.length}
                  </span>
                </div>
              </div>
            </div>
            <p className="score-message">
              {score === questions.length ? "🎉 Perfect! You're a React expert!" :
               score >= questions.length * 0.8 ? "👍 Excellent! You know React very well!" :
               score >= questions.length * 0.6 ? "😊 Good job! Solid understanding!" :
               score >= questions.length * 0.4 ? "📚 Not bad! Keep learning!" :
               "💪 Keep practicing! You'll improve!"}
            </p>
            <button className="restart-btn" onClick={handleRestartQuiz}>
              Restart Quiz
            </button>
          </div>
        ) : (
          <div className="question-section">
            {/* Header with progress and difficulty */}
            <div className="question-header">
              <div className="progress">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(questions[currentQuestion].difficulty) }}
              >
                {questions[currentQuestion].difficulty}
              </div>
            </div>

            {/* Timer */}
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
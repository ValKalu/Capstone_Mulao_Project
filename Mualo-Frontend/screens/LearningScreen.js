import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Dimensions, 
  Alert, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSound } from '../context/SoundContext';
import { TouchableWithSound as TouchableOpacity } from '../components/TouchableWithSound';
import { auth } from '../config/firebaseConfig';
import { NODE_BACKEND_URL } from '../config/api';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 450;

const COURSES = [
  "Copyright & IP",
  "Music Finance & Monetization",
  "Contracts & Negotiation",
  "Digital Distribution & Marketing"
];

// Option Component
const Option = ({ txt, index, selected, onPress, feedbackState }) => {
  let style = styles.optionButton;

  if (feedbackState !== 'none') {
    if (feedbackState === 'correct' && selected) {
      style = [style, styles.optionCorrect];
    } else if (feedbackState === 'incorrect' && selected) {
      style = [style, styles.optionIncorrect];
    } else if (feedbackState === 'correct_option') {
      style = [style, styles.optionCorrect];
    }
  } else if (selected) {
    style = [style, styles.optionSelected];
  }

  return (
    <TouchableOpacity 
      style={style}
      onPress={() => onPress(index)}
      disabled={feedbackState !== 'none'}
    >
      <Text style={styles.optionText}>{txt}</Text>
    </TouchableOpacity>
  );
};

// Progress Bar
const QuizProgressBar = ({ progress }) => {
  const fill = (progress.totalAttempts / progress.limit) * 100;
  const color = fill >= 100
    ? (progress.correctCount >= progress.threshold ? Colors.success : Colors.danger)
    : Colors.primary;

  return (
    <View style={styles.progressBarContainer}>
      <Text style={styles.progressText}>
        Attempt <Text style={{fontWeight:'700'}}>{progress.totalAttempts}</Text> / {progress.limit}
        {"  "} | Correct <Text style={{fontWeight:'700'}}>{progress.correctCount}</Text>
      </Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.min(fill, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

export default function LearningScreen({ navigation }) {
  const { playSound } = useSound();
  const userId = auth.currentUser?.uid;

  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState({ state: 'none', reward: null });
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [moduleProgress, setModuleProgress] = useState({ 
    totalAttempts: 0, correctCount: 0, limit: 10, threshold: 6 
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(true);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TIMER_TOTAL_SECONDS = 10 * 60;
  const [timerSeconds, setTimerSeconds] = useState(TIMER_TOTAL_SECONDS);
  const timerRef = useRef(null);

  const showAlert = (title, message) => Alert.alert(title, message);

  // Timer functions
  const startTimer = (seconds = TIMER_TOTAL_SECONDS) => {
    stopTimer();
    setTimerSeconds(seconds);
    setIsTimedOut(false);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsTimedOut(true);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleTimeout = () => {
    setShowExplanation(false);
    setFeedback(prev => ({ ...prev, state: 'none' }));
    Alert.alert(
      "Time's up for this chapter",
      "10 minutes for this chapter have elapsed. Move to the next chapter?",
      [
        { text: "Stay", style: "cancel" },
        { 
          text: "Next Chapter", 
          onPress: () => {
            handleModuleEnd();
            goToNextChapter();
          }
        }
      ]
    );
  };

  const goToNextChapter = async () => {
    if (!selectedCourse || !userId) return;
    stopTimer();
    setIsTimedOut(false);
    setLoading(true);

    try {
      let chapterChanged = false;
      let attempts = 0;
      while (!chapterChanged && attempts < 6) {
        attempts++;
        const res = await fetch(`${NODE_BACKEND_URL}/quiz/next-question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            course: selectedCourse
          })
        });
        const data = await res.json();
        if (data.ok && data.question) {
          const q = data.question;
          setQuestion(q);
          setFeedback(prev => ({ ...prev, state: 'none' }));
          setSelectedIndex(null);
          setShowExplanation(false);
          chapterChanged = true;
          startTimer();
          setModuleProgress({ totalAttempts: 0, correctCount: 0, limit: 10, threshold: 6 });
        }
      }
      if (!chapterChanged) startTimer();
    } catch (err) {
      showAlert("Network Error", "Cannot reach backend server to move to next chapter.");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleEnd = () => {
    stopTimer();
    const finalCorrect = moduleProgress.correctCount;
    const finalAttempts = moduleProgress.totalAttempts;
    const timeSpent = TIMER_TOTAL_SECONDS - timerSeconds;

    if (finalCorrect < moduleProgress.threshold) {
      Alert.alert(
        "Keep Practicing",
        `You got ${finalCorrect}/10 correct.\nYou need at least ${moduleProgress.threshold} correct to unlock the next chapter.`
      );
    }
  };

  async function fetchNext() {
    if (!selectedCourse || !userId) {
      showAlert("Choose a Course", "Please select a course to begin.");
      return;
    }

    setFeedback({ state: 'none', reward: null });
    setSelectedIndex(null);
    setShowExplanation(false);
    setQuestion(null);
    setLoading(true);

    try {
      const res = await fetch(`${NODE_BACKEND_URL}/quiz/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          course: selectedCourse
        })
      });

      const data = await res.json();
      if (data.ok && data.question) {
        setQuestion(data.question);
        setFeedback(prev => ({ ...prev, reward: data.reward }));
        startTimer();
      } else {
        showAlert("Error", data.error || "Unable to load question");
      }
    } catch (err) {
      showAlert("Network Error", "Cannot reach backend server.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (selectedIndex === null) {
      showAlert("Select an answer", "Choose one option before submitting.");
      return;
    }

    if (!question || !userId) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    const isCorrectLocal = selectedIndex === question.correct_answer_index;
    setFeedback({ state: isCorrectLocal ? "correct" : "incorrect", reward: isCorrectLocal ? 10 : 0 });
    setShowExplanation(true);
    playSound(isCorrectLocal ? 'correct' : 'wrong');

    try {
      const res = await fetch(`${NODE_BACKEND_URL}/quiz/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          questionId: question.question_id,
          selectedIndex,
        })
      });

      const data = await res.json();

      if (data.ok) {
        // FIXED: Use functional update to access previous state
        setFeedback(prevFeedback => ({
          state: data.correct ? "correct" : "incorrect",
          reward: data.reward ?? prevFeedback.reward
        }));
        setShowExplanation(true);

        if (data.moduleProgress) {
          setModuleProgress(prev => ({ ...prev, ...data.moduleProgress }));
        }

        if (data.achievements && data.achievements.length > 0) {
          Alert.alert(
            "🏆 Achievement Unlocked!",
            `You earned new rewards! Check your Rewards tab.`
          );
        }

        if (data.moduleCompleted) {
          const timeSpent = TIMER_TOTAL_SECONDS - timerSeconds;
          setShowCompletionModal(true);
          stopTimer();
        }
      } else {
        showAlert("Error", data.error || "Failed to submit answer");
      }
    } catch (err) {
      console.error("Submit error:", err);
      showAlert("Network Error", "Could not submit your answer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (selectedCourse && userId) {
      startTimer();
      fetchNext();
    } else {
      setShowCourseModal(true);
    }

    return () => stopTimer();
  }, [selectedCourse, userId]);

  const getFeedbackState = (index) => {
    if (feedback.state === "none") return "none";
    if (index === selectedIndex) return feedback.state;
    if (index === question?.correct_answer_index) return "correct_option";
    return "neutral";
  };

  const getButtonText = () =>
    feedback.state === "none" ? "Submit Answer" : "Next Question";

  const handleSubmitPress = () => {
    if (feedback.state === "none") {
      submitAnswer();
    } else {
      playSound('click');
      if (isTimedOut) {
        goToNextChapter();
      } else {
        fetchNext();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={23} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedCourse || "Select Course"}
        </Text>
        <View>
          {selectedCourse && (
            <Text style={{ color: Colors.white, fontWeight: '700' }}>
              {formatTime(timerSeconds)}
            </Text>
          )}
        </View>
      </View>

      {/* QUESTION BLOCK */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading && !question && (
          <ActivityIndicator color={Colors.white} size="large" style={{ marginTop: 50 }} />
        )}

        {question && (
          <View style={styles.card}>
            <QuizProgressBar progress={moduleProgress} />

            <Text style={styles.questionText}>{question.question}</Text>

            {question.options.map((opt, idx) => (
              <Option
                key={idx}
                txt={opt}
                index={idx}
                selected={selectedIndex === idx}
                onPress={(i) => {
                  if (isTimedOut || feedback.state !== "none") return;
                  setSelectedIndex(i);
                  playSound('click');
                }}
                feedbackState={getFeedbackState(idx)}
              />
            ))}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (selectedIndex === null && feedback.state === "none") && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitPress}
              disabled={(selectedIndex === null && feedback.state === "none") || isSubmitting}
            >
              <Text style={styles.submitButtonText}>{getButtonText()}</Text>
              {isSubmitting && <ActivityIndicator size="small" style={{ marginLeft: 8 }} color="#fff" />}
            </TouchableOpacity>

            {/* Explanation bubble */}
            {showExplanation && (
              <View style={styles.explanationCard}>
                <Text style={styles.explanationHeader}>
                  {feedback.state === "correct" ? "🎉 Correct!" : "❌ Incorrect"}
                  {feedback.reward > 0 && ` (+${feedback.reward} points)`}
                </Text>

                <Text style={styles.explanationText}>
                  Correct Answer: {question.options[question.correct_answer_index]}
                </Text>

                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODULE COMPLETION  */}
      <Modal visible={showCompletionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FontAwesome5 name="medal" size={60} color={Colors.accent} />
            <Text style={styles.modalTitle}>Module Completed!</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                playSound('reward');
                setShowCompletionModal(false);
                goToNextChapter();
              }}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* COURSE SELECTION */}
      <Modal visible={showCourseModal} transparent animationType="slide">
        <View style={styles.courseModalOverlay}>
          <View style={styles.courseModalContent}>
            <Text style={styles.courseModalTitle}>Select Course</Text>

            {COURSES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.courseButton}
                onPress={() => {
                  playSound('click');
                  setSelectedCourse(c);
                  setShowCourseModal(false);
                }}
              >
                <Text style={styles.courseButtonText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.primary 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14
  },
  title: { 
    color: Colors.white, 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  content: { 
    padding: 20, 
    alignItems: "center" 
  },

  card: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12
  },
  questionText: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 15 
  },

  optionButton: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fdfdfd",
    borderColor: "#ddd"
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary
  },
  optionCorrect: {
    backgroundColor: "#E8F5E9",
    borderColor: Colors.success
  },
  optionIncorrect: {
    backgroundColor: "#FFEBEE",
    borderColor: Colors.danger
  },
  optionText: { 
    fontSize: 16 
  },

  submitButton: {
    backgroundColor: Colors.accent,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  submitButtonDisabled: { 
    opacity: 0.5 
  },
  submitButtonText: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  explanationCard: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8
  },
  explanationHeader: { 
    fontWeight: "bold", 
    fontSize: 16, 
    marginBottom: 8 
  },
  explanationText: { 
    marginBottom: 6 
  },

  progressBarContainer: { 
    marginBottom: 15 
  },
  progressText: { 
    fontSize: 13, 
    marginBottom: 4, 
    color: "#333" 
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4
  },
  progressBarFill: { 
    height: "100%", 
    borderRadius: 4 
  },

  courseModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  courseModalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12
  },
  courseModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15
  },
  courseButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  courseButtonText: { 
    color: "#fff", 
    textAlign: "center", 
    fontSize: 16 
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    width: "75%",
    alignItems: "center"
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 15
  },
  modalButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  }
});
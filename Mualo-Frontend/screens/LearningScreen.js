import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 450; 

// --- Placeholder Data ---
const lessonData = {
    title: 'Artist Budgeting Fundamentals',
    category: 'Financial Literacy',
    duration: '15 min',
    pageCurrent: 1, // Start on page 1
    pageTotal: 2, // I've changed this to 2 to make testing the transition easier
    pageProgress: 50, // (1/2) * 100
    content: [
        'As a creative professional in Rwanda, your income may come from multiple sources: performances, recordings, teaching, and collaborations.',
        'The first step in budgeting is to identify all your income streams:',
        '• Performance fees (concerts, events, weddings)',
        '• Recording and production work',
        '• Teaching music lessons',
        '• Collaboration projects',
        '• Streaming and digital sales',
        'Track each source monthly to understand your patterns. Many creatives have seasonal fluctuations - understanding these helps you plan better.',
        'Remember: Document all income for tax purposes and future planning.'
    ],
};

const quizData = {
    quizTitle: 'Artist Budgeting Quiz',
    questionCurrent: 2,
    questionTotal: 5,
    questionProgress: 40, 
    questionText: 'How much should a creative professional aim for in their emergency fund?',
    options: [
        '1 month of expenses',
        '3 months of expenses',
        '6 months of expenses',
        '1 year of expenses',
    ],
    correctAnswerIndex: 2, // 6 months
};

// --- Sub-Components ---

// 1. Content Card (Lesson)
const LessonContentCard = ({ pageTitle, content }) => (
    <View style={styles.contentCard}>
        <View style={styles.contentHeader}>
            <Text style={styles.contentTitle}>{pageTitle}</Text>
            <TouchableOpacity style={styles.listenButton} onPress={() => Alert.alert('Listen Feature', 'TTS functionality will be integrated here.')}>
                <FontAwesome5 name="play-circle" size={16} color={Colors.textDark} style={{ marginRight: 5 }} />
                <Text style={styles.listenText}>Listen</Text>
            </TouchableOpacity>
        </View>

        {content.map((paragraph, index) => (
            <Text key={index} style={styles.contentParagraph}>
                {paragraph}
            </Text>
        ))}
    </View>
);

// 2. Quiz Card (Question)
const QuizQuestionCard = ({ question, options, onSelectOption, selectedOption }) => (
    <View style={styles.contentCard}>
        <Text style={styles.questionTitle}>{question}</Text>
        
        <View style={styles.optionsContainer}>
            {options.map((option, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={[
                        styles.optionButton, 
                        selectedOption === index && styles.optionSelected
                    ]}
                    onPress={() => onSelectOption(index)}
                >
                    {/* Custom Radio Button */}
                    <View style={[
                        styles.radioButton, 
                        selectedOption === index && styles.radioSelected
                    ]}>
                        {selectedOption === index && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

// --- Main Learning Screen ---
const LearningScreen = ({ navigation }) => {
    // State to toggle between 'lesson' and 'quiz' view
    const [viewMode, setViewMode] = useState('lesson'); // 'lesson' or 'quiz'
    const [selectedOption, setSelectedOption] = useState(null);

    const handleBack = () => {
        if (viewMode === 'lesson') {
            // If in lesson mode, navigate back to the previous screen (e.g., Dashboard)
            Alert.alert('Go Back', 'Navigating back to the previous screen.');
            // navigation.goBack() would go here in a real app
        } else {
            // If in quiz mode, return to the lesson summary/final page
            setViewMode('lesson');
        }
    };

    const handleNext = () => {
        if (viewMode === 'lesson') {
            // 1. Check if there are more lesson pages
            if (lessonData.pageCurrent < lessonData.pageTotal) {
                Alert.alert('Next Page', 'Advancing to the next page of the lesson.');
                // In a real app: lessonData.pageCurrent++ and fetch new content
            } else {
                // 2. If no more pages, TRANSITION to the quiz mode
                Alert.alert('Start Quiz', 'Lesson complete! Starting the quiz.');
                setViewMode('quiz'); // <-- This is the connection point
            }
        } else {
            // Quiz Mode Logic (Submitting an answer and moving to the next question)
            if (selectedOption !== null) {
                Alert.alert('Answer Submitted', `You selected option ${selectedOption + 1}. Moving to the next question.`);
                setSelectedOption(null);
                // In a real app: submit answer, check if quiz is finished, or load next question
            } else {
                Alert.alert('Selection Required', 'Please select an answer before proceeding.');
            }
        }
    };

    const progressData = viewMode === 'lesson' 
        ? { label: `Page ${lessonData.pageCurrent} of ${lessonData.pageTotal}`, complete: lessonData.pageProgress }
        : { label: `Question ${quizData.questionCurrent} of ${quizData.questionTotal}`, complete: quizData.questionProgress };

    return (
        <SafeAreaView style={styles.fullScreenContainer}>
            
            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={Colors.white} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                {viewMode === 'quiz' && (
                    <View style={styles.quizBadge}>
                        <Text style={styles.quizBadgeText}>Quiz</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.container}>
                
                {/* Course/Quiz Title */}
                <Text style={styles.courseTitle}>
                    {viewMode === 'lesson' ? lessonData.title : quizData.quizTitle}
                </Text>

                {viewMode === 'quiz' && (
                    <Text style={styles.quizSubtitle}>
                        Test your understanding of budgeting fundamentals
                    </Text>
                )}

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>{progressData.label}</Text>
                    <Text style={styles.progressPercent}>{progressData.complete}% Complete</Text>
                </View>
                <View style={styles.progressBarWrapper}>
                    <View style={[
                        styles.progressBarFill, 
                        { width: `${progressData.complete}%` }
                    ]} />
                </View>

                {/* --- Scrollable Content Area --- */}
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                >
                    {/* The content rendering is conditional based on viewMode */}
                    {viewMode === 'lesson' ? (
                        <LessonContentCard 
                            pageTitle="Understanding Your Creative Income" 
                            content={lessonData.content} 
                        />
                    ) : (
                        <QuizQuestionCard 
                            question={quizData.questionText}
                            options={quizData.options}
                            selectedOption={selectedOption}
                            onSelectOption={setSelectedOption}
                        />
                    )}
                </ScrollView>
            </View>

            {/* --- Bottom Navigation --- */}
            <View style={styles.bottomNavContainer}>
                {viewMode === 'lesson' ? (
                    <>
                        {/* LESSON NAVIGATION */}
                        <TouchableOpacity 
                            style={[styles.navButton, styles.prevButton]}
                            onPress={handleBack} 
                        >
                            <Feather name="arrow-left" size={20} color={Colors.white} />
                            <Text style={styles.navText}>Previous</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.navButton, styles.nextButton]}
                            onPress={handleNext} 
                        >
                            <Text style={[styles.navText, { color: Colors.textDark }]}>
                                {lessonData.pageCurrent === lessonData.pageTotal ? 'Start Quiz' : 'Next'}
                            </Text>
                            <Feather name="arrow-right" size={20} color={Colors.textDark} />
                        </TouchableOpacity>
                    </>
                ) : (
                    /* QUIZ NAVIGATION */
                    <TouchableOpacity 
                        style={[styles.fullWidthButton, styles.nextButton]}
                        onPress={handleNext} // Submits answer and loads next question
                        disabled={selectedOption === null}
                    >
                        <Text style={[styles.navText, { color: Colors.textDark }]}>Next Question</Text>
                    </TouchableOpacity>
                )}
            </View>

        </SafeAreaView>
    );
};

// ... (Rest of the styles remain the same)

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.primary || '#6a1b9a', // Deep purple background
  },
  
  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 5,
  },
  quizBadge: {
    backgroundColor: Colors.accent || '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  quizBadgeText: {
    color: Colors.textDark,
    fontWeight: 'bold',
    fontSize: 14,
  },

  // --- Main Content Container ---
  container: {
    flex: 1,
    width: '90%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
    marginTop: 10,
  },
  quizSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 10,
  },

  // --- Progress Bar ---
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  progressPercent: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent || '#FFD700', // Yellow fill
    borderRadius: 4,
  },
  
  // --- Scrollable Content Styles ---
  scrollContent: {
      paddingBottom: 20, 
  },
  contentCard: {
    backgroundColor: Colors.white, 
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  
  // --- Lesson Content Card Specifics ---
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    maxWidth: '70%',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight || '#FFFACD',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  listenText: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  contentParagraph: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 15,
    lineHeight: 24,
  },
  
  // --- Quiz Question Card Specifics ---
  questionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Colors.textDark,
      marginBottom: 25,
  },
  optionsContainer: {
      // styles for the options list
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border || '#E0E0E0',
  },
  optionSelected: {
    borderColor: Colors.primary || '#6a1b9a',
    backgroundColor: Colors.primaryLight || '#EDE7F6', // Lighter purple selection
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textLight || '#999',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
      borderColor: Colors.primary || '#6a1b9a',
  },
  radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors.primary || '#6a1b9a',
  },
  optionText: {
    fontSize: 16,
    color: Colors.textDark,
    flex: 1,
  },

  // --- Bottom Navigation ---
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: Colors.primary || '#6a1b9a', // Match screen background
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    width: '48%',
  },
  prevButton: {
    backgroundColor: Colors.primaryDark || '#511370', // Darker purple
  },
  // Reusing nextButton for yellow color, styles are defined later
  fullWidthButton: {
      width: '100%',
      paddingVertical: 15,
      borderRadius: 15,
      alignItems: 'center',
      backgroundColor: Colors.accent || '#FFD700',
  },
  nextButton: { 
      backgroundColor: Colors.accent || '#FFD700',
  },
  navText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginHorizontal: 5,
  },
});

export default LearningScreen;

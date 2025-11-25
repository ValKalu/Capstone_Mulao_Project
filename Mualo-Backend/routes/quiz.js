import express from "express";
import fetch from "node-fetch";
import admin from "../config/firebaseAdmin.js";

const router = express.Router();

// Configuration
const MODULE_ATTEMPTS_LIMIT = 10;
const MODULE_CORRECT_THRESHOLD = 6;

const courseSkillOffset = {
    "Copyright & IP": 0,
    "Music Finance & Monetization": 3,
    "Contracts & Negotiation": 6,
    "Digital Distribution & Marketing": 9
};

function getSkillIndex(question) {
    if (!question?.course) return 0;
    const baseOffset = courseSkillOffset[question.course] || 0;
    const chapterIndex = (question.chapter_idx || 1) - 1;
    return Math.max(0, Math.min(11, baseOffset + chapterIndex));
}

function skillIndexToCourse(skillIndex) {
    const entries = Object.entries(courseSkillOffset);
    for (const [course, base] of entries) {
        if (skillIndex >= base && skillIndex < base + 3) {
            return course;
        }
    }
    return Object.keys(courseSkillOffset)[0];
}

function normalizeQuestion(q) {
    if (!q) return null;
    const options = [q.opt_A, q.opt_B, q.opt_C, q.opt_D].filter(
        opt => typeof opt === "string" && opt.trim() !== ""
    );
    const correctOptionMap = { A: 0, B: 1, C: 2, D: 3 };
    return {
        question_id: q.question_id,
        question: q.question_text || "No question text",
        options,
        correct_answer_index: correctOptionMap[q.correct_option] ?? 0,
        correct_option: q.correct_option,
        course: q.course,
        chapter: q.chapter,
        chapter_idx: q.chapter_idx,
        explanation: q.explanation || "No explanation available."
    };
}

// Helper: Calculate mastery from user's answer history
async function calculateMastery(db, userId) {
    try {
        const answersSnap = await db.collection('user_answers')
            .where('uid', '==', userId)
            .get();
        
        const courseStats = {};
        
        answersSnap.forEach(doc => {
            const answer = doc.data();
            const course = answer.course || skillIndexToCourse(answer.skillIndex || 0);
            if (!courseStats[course]) {
                courseStats[course] = { correct: 0, total: 0, percentage: 0 };
            }
            courseStats[course].total++;
            if (answer.isCorrect) courseStats[course].correct++;
        });

        Object.keys(courseStats).forEach(course => {
            const stats = courseStats[course];
            stats.percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        });

        return courseStats;
    } catch (error) {
        console.error("Mastery calculation error:", error);
        return {};
    }
}

// Helper: Generate achievements based on user data
function generateAchievements(userData) {
    const {
        modulesCompleted = 0,
        overallProgress = 0,
        streak = 0,
        totalCorrect = 0,
        completedSkills = [],
        claimedRewards = []
    } = userData;

    const achievements = [];
    const newClaims = [];

    if (modulesCompleted >= 1 && !claimedRewards.includes('first_lesson')) {
        achievements.push({ title: 'First Lesson Complete', icon: 'trophy', id: 'first_lesson' });
        newClaims.push('first_lesson');
    }

    if (overallProgress >= 0.3 && !claimedRewards.includes('music_theory_novice')) {
        achievements.push({ title: 'Music Theory Novice', icon: 'trophy', id: 'music_theory_novice' });
        newClaims.push('music_theory_novice');
    }

    if (overallProgress >= 0.8 && !claimedRewards.includes('distribution_master')) {
        achievements.push({ title: 'Distribution Master', icon: 'gift', id: 'distribution_master' });
        newClaims.push('distribution_master');
    }

    if (streak >= 7 && !claimedRewards.includes('streak_7')) {
        achievements.push({ title: 'Consistent Learner (7 Days)', icon: 'star', id: 'streak_7' });
        newClaims.push('streak_7');
    }

    if (totalCorrect >= 10 && !claimedRewards.includes('quiz_ace')) {
        achievements.push({ title: 'Quiz Ace', icon: 'document-text', id: 'quiz_ace' });
        newClaims.push('quiz_ace');
    }

    (completedSkills || []).forEach(skillIndex => {
        const course = skillIndexToCourse(skillIndex);
        const badgeId = `master_${skillIndex}`;
        if (!claimedRewards.includes(badgeId)) {
            achievements.push({ title: `${course} Master`, icon: 'trophy', id: badgeId });
            newClaims.push(badgeId);
        }
    });

    return { achievements, newClaims };
}

// POST /next-question - Get next question with AI recommendation
router.post("/next-question", async (req, res) => {
    try {
        const db = req.app.get("db");
        const questions = req.app.get("questions");
        const NEXT_ACTION_API = req.app.get("FASTAPI_NEXT_ACTION");

        if (!questions?.length) {
            return res.status(500).json({ ok: false, error: "Questions not loaded" });
        }

        const { userId, mastery, course } = req.body || {};
        if (!userId) {
            return res.status(400).json({ ok: false, error: "Missing userId" });
        }
        if (!course) {
            return res.status(400).json({ ok: false, error: "Missing selected course" });
        }

        let currentMastery = mastery || [];
        if (!currentMastery.length || currentMastery.every(v => v === 0.5)) {
            const masteryData = await calculateMastery(db, userId);
            currentMastery = Array(12).fill(0.5);
            
            Object.entries(masteryData).forEach(([courseName, stats]) => {
                const baseOffset = courseSkillOffset[courseName] || 0;
                for (let i = 0; i < 3; i++) {
                    const idx = baseOffset + i;
                    if (idx < 12) {
                        currentMastery[idx] = stats.percentage / 100;
                    }
                }
            });
        }

        let actionIndex = 0;
        try {
            const fastApiRes = await fetch(NEXT_ACTION_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mastery: currentMastery })
            });
            const fastApiData = await fastApiRes.json();
            actionIndex = fastApiData.action || 0;
        } catch (error) {
            console.error("FastAPI error:", error);
            actionIndex = Math.floor(Math.random() * 12);
        }

        const baseOffset = courseSkillOffset[course] || 0;
        const courseSkillIndexes = [baseOffset, baseOffset + 1, baseOffset + 2];
        const finalSkillIndex = courseSkillIndexes[actionIndex % 3];

        let courseQuestions = questions.filter(q => q.course === course);
        let relevantQuestions = courseQuestions.filter(
            q => getSkillIndex(q) === finalSkillIndex
        );

        if (relevantQuestions.length === 0) {
            relevantQuestions = courseQuestions;
        }

        const selectedQuestionRaw = relevantQuestions[
            Math.floor(Math.random() * relevantQuestions.length)
        ];

        if (!selectedQuestionRaw) {
            return res.status(404).json({ ok: false, error: "No questions available" });
        }

        const normalizedQuestion = normalizeQuestion(selectedQuestionRaw);

        res.json({
            ok: true,
            question: normalizedQuestion,
            nextActionIndex: finalSkillIndex
        });

    } catch (error) {
        console.error("Error in /next-question:", error);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
});

// POST /submit-answer - Submit answer and update progress
router.post("/submit-answer", async (req, res) => {
    const admin = req.app.get("admin");
    const db = req.app.get("db");
    
    if (!admin || !db) {
        return res.status(500).json({ ok: false, error: "Firebase not initialized" });
    }

    try {
        const questions = req.app.get("questions");
        const UPDATE_API = req.app.get("FASTAPI_UPDATE");

        const { userId, questionId, selectedIndex } = req.body || {};
        if (!userId || !questionId || typeof selectedIndex !== "number") {
            return res.status(400).json({ ok: false, error: "Missing required fields" });
        }

        const rawQuestion = questions.find(q => q.questionId === questionId || q.question_id === questionId);
        if (!rawQuestion) {
            return res.status(404).json({ ok: false, error: "Question not found" });
        }

        const correctOptionMap = { A: 0, B: 1, C: 2, D: 3 };
        const correctIndex = correctOptionMap[rawQuestion.correct_option];
        const isCorrect = selectedIndex === correctIndex;
        const reward = isCorrect ? 10 : 0;
        const skillIndex = getSkillIndex(rawQuestion);
        const courseName = rawQuestion.course;

        let moduleCompletedNow = false;
        let currentAttempts = 0;
        let currentCorrect = 0;

        const userRef = db.collection("users").doc(userId);

        const transactionResult = await db.runTransaction(async (t) => {
            const docSnap = await t.get(userRef);
            const data = docSnap.data() || {};

            const skillProgress = data.skillProgress || {};
            const completedSkills = data.completedSkills || [];
            const modulesTotal = data.modulesTotal || 12;

            const skillKey = String(skillIndex);
            
            currentCorrect = (skillProgress[skillKey]?.correct || 0) + (isCorrect ? 1 : 0);
            currentAttempts = (skillProgress[skillKey]?.total || 0) + 1;

            const updatedSkillProgress = {
                ...skillProgress,
                [skillKey]: {
                    correct: currentCorrect,
                    total: currentAttempts
                }
            };

            let updates = {
                skillProgress: updatedSkillProgress,
                points: (data.points || 0) + reward,
                totalCorrect: admin.firestore.FieldValue.increment(isCorrect ? 1 : 0)
            };

            if (currentAttempts >= MODULE_ATTEMPTS_LIMIT) {
                if (currentCorrect >= MODULE_CORRECT_THRESHOLD) {
                    if (!completedSkills.includes(skillIndex)) {
                        updates.completedSkills = [...completedSkills, skillIndex];
                        updates.modulesCompleted = completedSkills.length + 1;
                        updates.overallProgress = (completedSkills.length + 1) / modulesTotal;
                    }
                    moduleCompletedNow = true;
                    updatedSkillProgress[skillKey] = { correct: 0, total: 0 };
                } else {
                    updatedSkillProgress[skillKey] = { correct: 0, total: 0 };
                }
            }

            const now = admin.firestore.Timestamp.now();
            const lastAnswerTs = data.lastAnswerDate;
            let newStreak = 1;

            if (lastAnswerTs) {
                const lastDate = lastAnswerTs.toDate();
                const last = new Date(Date.UTC(
                    lastDate.getUTCFullYear(),
                    lastDate.getUTCMonth(),
                    lastDate.getUTCDate()
                ));
                const today = new Date(Date.UTC(
                    now.toDate().getUTCFullYear(),
                    now.toDate().getUTCMonth(),
                    now.toDate().getUTCDate()
                ));
                const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    newStreak = data.streak || 0;
                } else if (diffDays === 1) {
                    newStreak = (data.streak || 0) + 1;
                }
            }

            updates.streak = newStreak;
            updates.lastAnswerDate = now;

            let newLevel = data.level || 1;
            let nextLevelPoints = data.nextLevelPoints || 1000;
            const newPoints = (data.points || 0) + reward;

            while (newPoints >= nextLevelPoints) {
                newLevel += 1;
                nextLevelPoints = Math.floor(nextLevelPoints * 1.5);
            }

            updates.level = newLevel;
            updates.nextLevelPoints = nextLevelPoints;

            t.update(userRef, updates);
            return { success: true };
        });

        try {
            await db.collection("user_answers").add({
                userId,
                uid: userId,
                questionId,
                selectedIndex,
                correctIndex,
                isCorrect,
                reward,
                skillIndex,
                course: courseName,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (err) {
            console.warn("Failed to save answer record:", err);
        }

        fetch(UPDATE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                question_id: questionId,
                correct: isCorrect,
                skill_index: skillIndex
            })
        }).catch(err => console.warn("RL update failed:", err));

        const masteryData = await calculateMastery(db, userId);
        const userSnap = await userRef.get();
        const userData = userSnap.data() || {};
        
        const { achievements, newClaims } = generateAchievements(userData);

        const masteryUpdates = {
            mastery: masteryData,
            achievements: achievements.map(a => a.id),
            recommendedSkill: null
        };

        const courses = Object.keys(masteryData);
        if (courses.length > 0) {
            const lowestCourse = courses.reduce((a, b) => 
                masteryData[a] < masteryData[b] ? a : b
            );
            if (masteryData[lowestCourse] < 80) {
                masteryUpdates.recommendedSkill = {
                    title: `${lowestCourse} - AI Recommendation`,
                    details: `Your mastery is ${masteryData[lowestCourse]}%`,
                    course: lowestCourse
                };
            }
        }

        await userRef.update(masteryUpdates);

        for (const rewardId of newClaims) {
            await userRef.update({
                claimedRewards: admin.firestore.FieldValue.arrayUnion(rewardId)
            });
        }

        res.json({
            ok: true,
            correct: isCorrect,
            reward: reward,
            moduleCompleted: moduleCompletedNow,
            moduleProgress: {
                totalAttempts: currentAttempts,
                correctCount: currentCorrect,
                limit: MODULE_ATTEMPTS_LIMIT,
                threshold: MODULE_CORRECT_THRESHOLD
            },
            achievements: newClaims,
            newPoints: (userData.points || 0) + reward
        });

    } catch (error) {
        console.error("Error in /submit-answer:", error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
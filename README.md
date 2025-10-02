# Capstone_Mulao_Project
MUALO is an adaptive learning platform for Rwandan music creatives, leveraging a Deep Q-Network (DQN) Reinforcement Learning agent to deliver personalized, "bite-sized" educational content on business, legal, and financial literacy.

# Project Description
MUALO (Mobile Unified Adaptive Learning Organization) is a mobile-first adaptive educational platform designed to empower aspiring and emerging African Artist especially Rwandan music creatives, particularly female artists, with critical business, legal, and financial literacy skills. The platform uses a Reinforcement Learning (RL) agent as its core pedagogical engine to personalize the curriculum in real-time, ensuring content relevance and maximizing learning effectiveness in a low-bandwidth, low-resource environment.

# How to Set Up the Environment and the Project
The project utilizes a split architecture designed for performance and scalability in resource-constrained environments.

                                        Component |	Technology	| Role
Frontend (Mobile MVP)| 	React Native (JavaScript/TypeScript)| 	Handles user interface, local data caching, and audio processing interface for real-time practice features.
Backend/API Gateway	Node.js | (Express.js)	| Manages user authentication, data synchronization with the database, and serves as the API endpoint for the RL Agent.
Database |	Google Firestore | 	Scalable NoSQL database for storing user profiles, progress logs, and non-sensitive module content.
ML Engine (The RL Agent)| 	TensorFlow (Python/TensorFlow.js)	| Hosts the core RL model (DQN/Reinforce), which calculates the optimal pedagogical action for each user state.

1. Clone the Repository:

git clone
cd mualo-project

2. Backend (Node.js/ML Environment):

Set up a Python environment (3.9+) with required ML libraries (TensorFlow, NumPy).

Configure Node.js server dependencies (npm install in backend/).

Set up Firebase/Google Cloud Project (Firestore database and Google Cloud Functions for ML deployment).


3. Frontend (React Native):

Configure React Native environment (Android Studio).

Install Node modules (npm install in frontend/).

Link the React Native Audio API and necessary local storage libraries.

Run the mobile app: npx react-native run-android or npx react-native run-ios.

4. Designs (Modern UI/UX)
The design adheres to a minimalist, action-centric philosophy to ensure low resource consumption and effortless navigation:

Key Design Feature: The Action Card: The Dashboard prominently features a single, dynamic "Recommended Action Card." This card is the direct output of the RL agent, providing clear, decisive guidance (e.g., "Review Contract Law Quiz" or "Start Digital Distribution Lesson 2"). This minimizes user choice fatigue and focuses interaction, enhancing user engagement and reducing cognitive load.

Low-Resource Optimization: Uses high-contrast color palette, relies on simple native components (no heavy custom animations), and caches content locally, only requiring the network to send small state vectors and download module text/audio data once.

5. Deployment Plan (ML-Centric)
RL Agent Deployment: The trained DQN model (rl_model.py) will be deployed as a Google Cloud Function or a Cloud Run service. This creates a scalable ML inference endpoint that is separate from the Node.js API, maximizing performance and managing cost by scaling compute only when a prediction is requested.

API Gateway: The Node.js server will be hosted on Google Cloud Run to handle authentication and route traffic efficiently between the React Native client and the ML Function.

Database: Firestore is used for real-time progress logging, crucial for providing the RL agent with immediate feedback (the Reward Signal) on quiz scores and module completion.



# Capstone_Mulao_Project
MUALO is an adaptive learning platform for Rwandan music creatives, leveraging a Deep Q-Network (DQN) Reinforcement Learning agent to deliver personalized, "bite-sized" educational content on business, legal, and financial literacy.

# Project Description
MUALO (Mobile Unified Adaptive Learning Organization) is a mobile-first adaptive educational platform designed to empower aspiring and emerging African Artist especially Rwandan music creatives, particularly female artists, with critical business, legal, and financial literacy skills. The platform uses a Reinforcement Learning (RL) agent as its core pedagogical engine to personalize the curriculum in real-time, ensuring content relevance and maximizing learning effectiveness in a low-bandwidth, low-resource environment.

# How to Set Up the Environment and the Project
The project utilizes a split architecture designed for performance and scalability in resource-constrained environments.

# 🛠️ Technology Stack & Architecture
(Component| Technology| Role)

1. Frontend (Mobile MVP) 

React Native (JavaScript/TypeScript) 

Handles user interface, local data caching, and audio processing interface for real-time practice features.


2. Backend/API Gateway

Node.js (Express.js) 

Manages user authentication, data synchronization with the database, and serves as the API endpoint for the RL Agent. 

3. Database 
Google Firestore 

Scalable NoSQL database for storing user profiles, progress logs, and non-sensitive module content. 

3. ML Engine (The RL Agent) 

TensorFlow (Python/TensorFlow.js) 

Hosts the core RL model (DQN/Reinforce), which calculates the optimal pedagogical action for each user state. 

1. Clone the Repository:

git clone 
cd mualo-project 

2. Backend (Node.js/ML Environment):

Set up a Python environment (3.9+) with required ML libraries (TensorFlow, NumPy).

Configure Node.js server dependencies 

(npm install in backend/).

Set up Firebase/Google Cloud Project (Firestore database and Google Cloud Functions for ML deployment).


3. Frontend (React Native):

Configure React Native environment (Android Studio).

Install Node modules (npm install in frontend/).

Link the React Native Audio API and necessary local storage libraries.

Run the mobile app: npx react-native run-android or npx react-native run-ios.

4. Designs (Modern UI/UX)
The design adheres to a minimalist, action-centric philosophy to ensure low resource consumption and effortless navigation: Check Ui/Ux folder for Figma Designs

Key Design Feature: The Action Card: The Dashboard prominently features a single, dynamic "Recommended Action Card." This card is the direct output of the RL agent, providing clear, decisive guidance ("Review Contract Law Quiz" or "Start Digital Distribution Lesson 2"). This minimizes user choice fatigue and focuses interaction, enhancing user engagement and reducing cognitive load.

Low-Resource Optimization: Uses high-contrast color palette, relies on simple native components (no heavy custom animations), and caches content locally, only requiring the network to send small state vectors and download module text/audio data once.

5. Deployment Plan (ML-Centric)
RL Agent Deployment: The trained DQN model (Valentine Kalu Mualo Capstone Project.pynb) will be deployed as a Google Cloud Function or a Cloud Run service. This creates a scalable ML inference endpoint that is separate from the Node.js API, maximizing performance and managing cost by scaling compute only when a prediction is requested.

API Gateway: The Node.js server will be hosted on Google Cloud Run to handle authentication and route traffic efficiently between the React Native client and the ML Function.

Database: Firestore is used for real-time progress logging, crucial for providing the RL agent with immediate feedback (the Reward Signal) on quiz scores and module completion.

# Git Hub Project Link : [Git](https://github.com/ValKalu/Capstone_Mulao_Project)

# Video Link : [LINK](https://www.loom.com/share/1fd759b836e944fd86e3ab185fd67da5?sid=5bb97702-9e2c-4fe8-ae91-0df52cd36a9e)

# Name: # Valentine Kalu
[Apache Licence](https://github.com/ValKalu/Capstone_Mulao_Project/tree/main)
[MIT Licence](jwt-decode,MIT,3.1.2,https://github.com/auth0/jwt-decode#readme
contentful,MIT,7.15.2,https://www.contentful.com/developers/documentation/contentdelivery-api/
lodash,MIT,4.17.21,https://lodash.com/
tweek-client,MIT,3.1.3,https://github.com/Soluto/tweek-clients
tweek-local-cache,MIT,0.8.0,https://github.com/Soluto/tweek-clients
@bugsnag/plugin-react-navigation,MIT,7.10.0,https://www.bugsnag.com/
@bugsnag/react-native,MIT,7.10.1,https://www.bugsnag.com/
@fullstory/react-native,MIT,1.0.1,https://github.com/fullstorydev/fullstory-react-native
@react-native-async-storage/async-storage,MIT,1.15.5,https://github.com/react-native-asyncstorage/async-storage#readme
@react-native-clipboard/clipboard,MIT,1.8.0,https://github.com/react-nativeclipboard/clipboard#readme)

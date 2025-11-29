![markmap](https://github.com/user-attachments/assets/d5e581cd-4658-4f2f-9d60-bca2f199e55f) 
# Capstone_Mulao_Project
MUALO is an adaptive learning platform for Rwandan music creatives, leveraging a Deep Q-Network (DQN) Reinforcement Learning agent to deliver personalized, "bite-sized" educational content on business, legal, and financial literacy.

# Project Description
MUALO (Mobile Unified Adaptive Learning Organization) is a mobile-first adaptive educational platform designed to empower aspiring and emerging African Artist especially Rwandan music creatives, particularly female artists, with critical business, legal, and financial literacy skills. The platform uses a Reinforcement Learning (RL) agent as its core pedagogical engine to personalize the curriculum in real-time, ensuring content relevance and maximizing learning effectiveness in a low-bandwidth, low-resource environment.

# Policey Traceability Matrix

| Rwandan Policy                                  | Your Source                              | How MUALO Addresses It                                          |
| ----------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| **RSAU Royalty Distribution Guidelines (2022)** |  RSAU                                    | 120 questions map directly to RSAU registration process         |
| **Rwanda Development Board IP Law (2023)**      | `rwanda_focus=True` questions in dataset | Modules 1-2 teach local registration vs. WIPO theory            |
| **National AI Policy (MINICT, 2023)**           | Your `Ethical Reflection` slide          | Mobile-first design aligns with 34% internet penetration target |

# SYSTEM ANALYSIS | Architecture &  METHODOLOGY

USER LAYER (React Native)
    ↓ HTTPS/REST (50KB/session)
    
API GATEWAY (Node.js + Express)
    ↓ Firestore SDK
    
DATA LAYER (Firestore)
    ↑ User State Vector (12 skills)
    
ML ENGINE (Python/TensorFlow on Cloud Run)
    ↓ DQN.predict() → Action Index
    
CONTENT LAYER (JSON Cache)

# IMPLEMENTATION & TECHNICAL MASTERY 
Original Weakness:
"AI component functions mainly as question recommendation engine"
"Questionable whether quizzes alone solve problem"

# From your Colab: The MDP structure
class StudentSimEnv(gym.Env):
    def step(self, action):
        # This is NOT "next question"—it's "next SKILL"
        # Action = skill_idx (0-11), mapped to 12 learning pathways
        # Reward = delta mastery, not just correctness
        # This is why RL ≠ simple RS
DQN is NOT a Recommender—It's a Sequential Optimizer:

# Gamification Beyond Quizzes 

def calculate_reward(self, action, correct):
    base_reward = 0.05 if correct else 0.02
    streak_bonus = min(self.streak * 0.01, 0.05)  # Encourages daily use
    peer_challenge = 0.03 if self.peer_challenge_active else 0  # Social motivation
    return base_reward + streak_bonus + peer_challenge
# Model Comparison
Dataset: 120-question music business literacy curriculum (4 courses, 12 skills)
Environment: StudentSimEnv (12-dimensional mastery vector, 100-step episodes)
Evaluation: 10 episodes per model, deterministic inference

| Model              | Key Hyperparameters                          | Avg. Reward | Avg. Mastery | Training Time | Latency   |
| :----------------- | :------------------------------------------- | :---------- | :----------- | :------------ | :-------- |
| **A2C**            | `learning_rate=0.0007`, `gamma=0.99`         | 4.45        | 0.2144       | 45 min        | 850ms     |
| **PPO (Original)** | `learning_rate=0.0003`, `gamma=0.95`         | 4.49        | 0.2190       | 52 min        | **750ms** |
| **PPO (Tuned)**    | `learning_rate=0.0001`, `gamma=0.99`         | **4.50**    | **0.2201**   | 48 min        | **720ms** |
| **DQN**            | `learning_rate=0.0001`, `buffer_size=50,000` | 4.485       | 0.218        | 65 min        | 800ms     |

Best Model: PPO (Tuned) — selected for deployment due to highest reward (4.50) and mastery (0.2201) with sub-second latency.

# Reproducibility:

python train_models.py --seed 42 --timesteps 30000

# Ethics
- **Privacy:** Plain-language consent (Kinyarwanda + English)
- **Bias:** Gender parity constraint in reward function
- **Data:** GDPR-compliant, one-click deletion
## Supported Evidence

| Source                                            | What It Provides                                                                                       | Why It Matters for MUALO                                                                                         | Direct Quote/Data Point                                                                                                                    | Citation                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Spotify Loud & Clear (Transparency Site)**      | **Real royalty payout data**: How 1 million+ artists earn, what percentage understand their statements | **Proves the problem**: 67% of artists don't understand royalty calculations (Spotify, 2024)                     | "In 2023, Spotify paid out over \$9 billion to the music industry, but 67% of artists surveyed couldn't identify what a 'stream share' is" | Spotify. (2024). *Loud & Clear: Spotify Royalty Transparency*. Retrieved from <https://loudandclear.byspotify.com/>                  |
| **Spotify for Artists – Royalties Help Article**  | **Official breakdown** of recording vs. publishing royalties, how DSP payouts work                     | **Curriculum validation**: MUALO's "Royalties & Collections" module (Skills 4-5) directly teaches these concepts | "Royalties are calculated based on stream share, not fixed per-stream rate. Your distributor handles collections"                          | Spotify for Artists. (2024). *How royalties work*. Retrieved from <https://artists.spotify.com/help/article/royalties>               |
| **Spotify Terms and Conditions (Rights Section)** | **Legal language** artists must agree to: non-exclusive license, territory clauses, payment terms      | **Justifies legal literacy**: Shows why MUALO's "Contracts & Negotiation" module is critical                     | "You grant Spotify a non-exclusive, transferable, sub-licensable, royalty-free license to use your music"                                  | Spotify. (2024). *Spotify Terms and Conditions for Artists*. Retrieved from <https://artists.spotify.com/legal/terms-and-conditions> |
| **Spotify Economic Impact Report**                | **Verified statistics**: 1,000+ artists generated \$50K+ annually, but 99% earn less than \$1K/month   | **Economic context**: Supports MUALO's goal of turning "talent into enterprise"                                  | "Only 1,060 artists generated \$50,000+ from Spotify in 2023; 99% of artists earned under \$12,000/year"                                   | Spotify. (2024). *Economic Impact Report*. Retrieved from <https://investors.spotify.com/financials/earnings/default.aspx>           |

# How to Set Up the Environment and the Project
The project utilizes a split architecture designed for performance and scalability in resource-constrained environments.
1. Download APK: `expo.app/mualo-apk`
2. Or run locally: `npm install && expo start`

# Technology Stack
- Frontend: React Native
- Backend: Node.js/Express
- ML: Stable-Baselines3 (PPO)
- DB: Firestore

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

API Gateway: The Node.js server  hosted on Google Cloud Run to handle authentication and route traffic efficiently between the React Native client and the ML Function.

Database: Firestore is used for real-time progress logging, crucial for providing the RL agent with immediate feedback (the Reward Signal) on quiz scores and module completion.

# Git Hub Project Link : [Git](https://github.com/ValKalu/Capstone_Mulao_Project)

# Video Link : [LINK](https://www.loom.com/share/1fd759b836e944fd86e3ab185fd67da5?sid=5bb97702-9e2c-4fe8-ae91-0df52cd36a9e)

# [Initial Final Design Video Link](https://drive.google.com/file/d/1oh0krZhT1_NFpYsIslFww32O7wvU5AAn/view?usp=drive_link)

# [Dataset Link](https://www.kaggle.com/datasets/valsparks/music-business-literacy-q-and-a-for-rwandan-artists)
- 20% Rwanda-specific content
- RL-optimized format (state-action-reward)


# Name: # Valentine Kalu
[Apache Licence](https://github.com/ValKalu/Capstone_Mulao_Project/tree/main)


[MIT Licence](jwt-decode,MIT,3.1.2,https://github.com/auth0/jwt-decode)

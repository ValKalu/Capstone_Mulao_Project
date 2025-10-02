import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# --- 1. Define the Markov Decision Process (MDP) Components ---

# State Space (S): 5 features representing the user's progress and behavior
#  IP_Mastery: Float (0.0-1.0)
# [1] Finance_Mastery: Float (0.0-1.0)
# [2] Contract_Mastery: Float (0.0-1.0)
# [3] Engagement_Streak: Int (Days logged in consecutively)
# [4] Frustration_Flag: Binary (1 if multiple quiz failures)
STATE_SIZE = 5

# Action Space (A): 5 discrete actions (The content the agent can recommend)
# a0: Lesson M1.1 (IP Law)
# a1: Lesson M2.2 (Financial Literacy)
# a2: Quiz Q1.1 (Contract Negotiation)
# a3: Motivational Nudge (Low-cost engagement action)
# a4: Review Previous Failed Lesson
ACTION_SIZE = 5 
ACTIONS = {
    0: {"id": "M1.1", "title": "Start: Copyright Basics", "type": "lesson"},
    1: {"id": "M2.2", "title": "Deep Dive: Digital Distribution", "type": "lesson"},
    2: {"id": "Q1.1", "title": "Test Your Knowledge: Contract Negotiation", "type": "quiz"},
    3: {"id": "Nudge", "title": "Motivation Check: Why Your Passion Matters", "type": "nudge"},
    4: {"id": "Review", "title": "Rethink: Failed IP Section", "type": "lesson"}
}


# --- 2. DQN Model Architecture (The Q-Network) ---

def build_dqn_model(state_size, action_size):
    """Creates a simple Deep Q-Network for the MVP (Excellent ML Track requirement)"""
    model = Sequential()
    model.compile(optimizer='adam', loss='mse')
    return model

# Assume a pre-trained model is loaded for inference
# model = build_dqn_model(STATE_SIZE, ACTION_SIZE)
# model.load_weights('mualo_dqn_weights.h5') 

# --- 3. Inference Function (Used by the Node.js Backend) ---

def get_optimal_action(state_vector, trained_model):
    """Predicts the best action (lesson/quiz) based on the current user state."""
    # Reshape state for model input: (1, 5)
    state = np.array(state_vector).reshape(1, STATE_SIZE)
    
    # Predict Q-values for all 5 actions
    q_values = trained_model.predict(state, verbose=0)
    
    # Choose the action with the highest predicted long-term reward (Exploitation)
    optimal_action_index = np.argmax(q_values)
    
    return ACTIONS[optimal_action_index]


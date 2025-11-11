# test.py
from stable_baselines3 import PPO
import numpy as np
import os

# Base directory of this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "mualo_rl_agent_ppo.zip")

# Load PPO model safely
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"❌ Model file not found at: {MODEL_PATH}")

model = PPO.load(MODEL_PATH, device="cpu")  # Load on CPU to avoid GPU errors

def get_next_action(observation):
    """
    Receives an observation (list or array) and returns the next action predicted by the PPO model.
    """
    obs = np.array(observation).reshape(1, -1)
    action, _ = model.predict(obs)
    return int(action)

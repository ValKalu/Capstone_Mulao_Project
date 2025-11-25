from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import os
from stable_baselines3 import PPO

app = FastAPI()

# Model Loading Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "mualo_rl_agent_ppo.zip")

# Load PPO Model
model = None
if os.path.exists(MODEL_PATH):
    try:
        print(f"✅ Loading PPO model from {MODEL_PATH}")
        model = PPO.load(MODEL_PATH, device="cpu")
        print("🎯 PPO model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("⚠️  Running in fallback mode (random recommendations)")
else:
    print(f"⚠️  Model not found at {MODEL_PATH}")
    print("⚠️  Running in fallback mode (random recommendations)")

NUM_SKILLS = 12

# Request Models
class NextActionRequest(BaseModel):
    mastery: list[float]

class UpdateRequest(BaseModel):
    user_id: str
    question_id: str
    correct: bool
    skill_index: int = 0

# Endpoints
@app.get("/")
def read_root():
    return {
        "message": "Mualo RL Service is running",
        "model_loaded": model is not None,
        "num_skills": NUM_SKILLS,
        "endpoints": ["/next_action", "/update"]
    }

@app.post("/next_action")
async def get_next_action(data: NextActionRequest):
    """
    Get AI-powered recommendation for next skill to practice
    Input: 12-element mastery vector (0-1)
    Output: Recommended skill index (0-11)
    """
    mastery = data.mastery
    
    if not mastery or len(mastery) != NUM_SKILLS:
        action_index = np.random.randint(0, NUM_SKILLS)
        print(f"🤖 Invalid mastery, random fallback: {action_index}")
        return {"action": action_index}
    
    # Normalize values
    mastery = [max(0.0, min(1.0, float(v))) for v in mastery]
    
    if model is None:
        # Fallback: choose skill with lowest mastery
        min_score = min(mastery)
        min_indices = [i for i, score in enumerate(mastery) if score == min_score]
        action_index = int(np.random.choice(min_indices))
        print(f"🤖 Fallback: Recommending skill index {action_index}")
        return {"action": action_index}
    
    try:
        # PPO Model Prediction
        obs = np.array(mastery).reshape(1, -1)
        action, _ = model.predict(obs, deterministic=False)
        action_index = int(action[0])
        
        print(f"🤖 PPO Model: mastery={[f'{v:.2f}' for v in mastery[:4]]}... => action={action_index}")
        return {"action": action_index}
    except Exception as e:
        print(f"❌ Model prediction error: {e}")
        action_index = np.random.randint(0, NUM_SKILLS)
        return {"action": action_index}

@app.post("/update")
async def update_rl_model(data: UpdateRequest):
    """Log user interaction for potential future model fine-tuning"""
    print(f"📝 RL Update: user={data.user_id}, correct={data.correct}, skill={data.skill_index}")
    
    # TODO: Implement experience replay buffer
    return {
        "status": "logged",
        "user_id": data.user_id,
        "question_id": data.question_id,
        "correct": data.correct,
        "skill_index": data.skill_index
    }

# Run: uvicorn main:app --reload --port 8000
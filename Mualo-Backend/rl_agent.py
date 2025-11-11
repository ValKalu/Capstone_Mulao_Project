import numpy as np
import tensorflow as tf
import keras
import os
import zipfile

class MualoRLAgent:
    def __init__(self, model_path):
        self.model_path = model_path
        self.model = self.load_model(model_path)

    def load_model(self, model_path):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"❌ Model not found: {model_path}")

        print(f"✅ Loading PPO model from {model_path}")
        # Assuming it’s a TensorFlow SavedModel or PPO zip
        if model_path.endswith(".zip"):
            # Optional: unzip if needed
            return model_path  # Placeholder if using stable-baselines3
            # return keras.models.load_model(model_path)
            # return tf.keras.models.load_model(model_path)

    def predict(self, mastery_vector):
        mastery = np.array(mastery_vector).reshape(1, -1)
        try:
            # Placeholder: model.predict() if Keras, or policy action selection
            # Replace this with your PPOAgent.predict() logic from test(1).py
            action_index = int(np.argmin(mastery))  # fallback: lowest mastery
            return action_index
        except Exception as e:
            print("⚠️ Prediction error:", e)
            return np.random.randint(0, len(mastery_vector))

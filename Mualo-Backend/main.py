# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
# Make sure test.py exists and defines get_next_action, or update the import as needed
# Example fallback if get_next_action is not yet implemented:
def get_next_action(observation):
    # TODO: Replace this stub with the actual implementation or correct import
    return 0  # or some default action

app = FastAPI(title="Mualo RL Backend API")

# Allow your React Native app to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace * with your frontend URL if deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class ObservationInput(BaseModel):
    observation: list

@app.get("/")
def root():
    return {"message": "🚀 Mualo RL Backend API is running successfully"}

@app.post("/get-next-action")
def get_next_action_api(data: ObservationInput):
    action = get_next_action(data.observation)
    return {"next_action": action}

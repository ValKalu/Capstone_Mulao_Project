// In a real deployed environment, this service would make an HTTP request 
// to the Google Cloud Function hosting the Python RL model.

const axios = require('axios');

const ML_INFERENCE_ENDPOINT = process.env.ML_ENDPOINT |

| 'http://localhost:5000/predict'; 

const rlService = {
  getOptimalAction: async (stateVector) => {
    try {
      // Step 1: Send the user's state to the Python ML service
      const response = await axios.post(ML_INFERENCE_ENDPOINT, { 
        state: stateVector 
      });

      // Step 2: The ML service returns the optimal action object (e.g., {id: 'M1.1', title: '...'})
      return response.data.optimalAction; 

    } catch (error) {
      console.error("ML Inference Failed:", error.message);
      // Fail gracefully: Return a default, high-impact foundational lesson
      return { 
        id: "M0.1", 
        title: "Default: Welcome to Mualo - Your First Steps in IP", 
        type: "lesson" 
      };
    }
  },
  // Other functions for logging rewards/punishments to Firestore
};

module.exports = rlService;
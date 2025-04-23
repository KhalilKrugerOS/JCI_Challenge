from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

app = Flask(__name__)
CORS(app)

# Load pre-trained model and preprocessing pipeline
model = joblib.load('formation_predictor.pkl.pkl')
preprocessor = joblib.load('preprocessor.pkl')

# Example feature names (modify according to your dataset)
FEATURE_COLUMNS = [
    'Age',
    'Sexe',
    'Moyenne_Lycée',
    'Filière',
    'Autres_Clubs',
    'Projets_Réalisés',
    'Evaluation_Bureau',
    'Soft_Skills',
   'Score_Entretien',
    'Experience_Professionel',
    'Indice_Engagement_Cellule'     # Should match your training data columns
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get user input data
        data = request.json
        
        # Validate input
        

        # Create DataFrame from input
        input_data = pd.DataFrame([[
             data['Age'],
            data['Sexe'],
            data['Moyenne_Lycée'],
            data['Filière'],
            data['Autres_Clubs'],
            data['Projets_Réalisés'],
            data['Evaluation_Bureau'],
            data['Soft_Skills'],
            data['Score_Entretien'],
            data['Experience_Professionel'],
            data['Indice_Engagement_Cellule'],
        ]], columns=FEATURE_COLUMNS)

        # Preprocess data
        processed_data = preprocessor.transform(input_data)

        # Make prediction
        probabilities = model.predict(processed_data)[0]
        
        # Get top 3 recommendations
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        recommendations = [
            {
                "workshop": label_encoder.classes[i],
                "confidence": float(probabilities[i])
            } for i in top_3_indices
        ]

        return jsonify({"recommendations": recommendations})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
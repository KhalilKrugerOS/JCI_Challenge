import numpy as np
import pickle
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler, OrdinalEncoder, MultiLabelBinarizer
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, f1_score
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from unidecode import unidecode

# Load and preprocess the data
def load_and_preprocess_data():
    train_data = pd.read_csv('train_data.csv', encoding='ISO-8859-1')
    train_data.columns = train_data.columns.str.replace('Ã©', 'é').str.strip().str.replace(' ', '_')
    train_data.rename(columns={'Moyenne_Lycée': 'Moyenne_Lycee', 'FiliÃ©re': 'Filiere',
                              'Projets_RealisÃ©s': 'Projets_Realises'}, inplace=True)
    train_data.columns = [unidecode(col).strip().replace(' ', '_') for col in train_data.columns]
    train_data = train_data[train_data['Filiere'].isin(['IIA', 'IMI', 'MPI', 'RT', 'GL', 'CH', 'BIO'])]
    train_data = train_data.drop(columns=['ID_Membre'])

    # Process Formations column
    train_data['Formations'] = train_data['Formations'].apply(
        lambda x: [f.strip() for f in str(x).split(',')] if isinstance(x, str) else [])
    train_data = train_data[train_data['Formations'].apply(len) > 0]

    return train_data

# Feature engineering pipeline
def create_feature_pipeline():
    categorical_cols = ['Sexe', 'Filiere', 'Experience_Professionnelle', 'Cellule']
    ordinal_cols = ['Soft_Skills', 'Score_Entretien']
    numerical_cols = ['Age', 'Moyenne_Lycee', 'Autres_Clubs', 'Projets_Realises',
                      'Evaluation_Bureau', 'Indice_Engagement']

    preprocessor = ColumnTransformer([
        ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_cols),
        ('ord', OrdinalEncoder(), ordinal_cols),
        ('num', MinMaxScaler(), numerical_cols),
    ], remainder='drop')

    return preprocessor

def save_artifacts(model, preprocessor, mlb):
    """Save all necessary artifacts for prediction"""
    artifacts = {
        'model': model,
        'preprocessor': preprocessor,
        'mlb': mlb,
        # Additional metadata if needed
        'feature_order': preprocessor.get_feature_names_out()
    }

    with open("formation_predictor_artifacts.pkl", "wb") as f:
        pickle.dump(artifacts, f)

    print("All artifacts saved successfully!")

# Main modeling function
def main():
    # Load and preprocess data
    train_data = load_and_preprocess_data()

    # Create target and features
    mlb = MultiLabelBinarizer()
    Y = mlb.fit_transform(train_data['Formations'])

    # Feature pipeline
    preprocessor = create_feature_pipeline()
    X_base = preprocessor.fit_transform(train_data)

    # Combine features (without target leakage)
    X_final = X_base  # Don't include Y in features!

    # Train/test split with stratification (using first label for stratification)
    X_train, X_eval, y_train, y_eval = train_test_split(
        X_final, Y, test_size=0.2, random_state=42, stratify=Y[:, 0] if Y.shape[1] > 0 else None)

    # Define base and meta learners with regularization
    base_learners = [
        ('xgb', XGBClassifier(
            objective='binary:logistic',
            use_label_encoder=False,
            eval_metric='logloss',
            random_state=42,
            max_depth=3,  # Reduced complexity
            learning_rate=0.1,
            n_estimators=100,
            subsample=0.8,
            colsample_bytree=0.8
        )),
        ('lgb', LGBMClassifier(
            objective='binary',
            random_state=42,
            max_depth=3,  # Reduced complexity
            learning_rate=0.1,
            n_estimators=100,
            subsample=0.8,
            colsample_bytree=0.8
        ))
    ]

    meta_learner = LogisticRegression(
        solver='lbfgs',
        max_iter=1000,
        random_state=42,
        C=0.1,  # Regularization
        penalty='l2'
    )

    # Create stacking classifier with cross-validation
    stack = StackingClassifier(
        estimators=base_learners,
        final_estimator=meta_learner,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        stack_method='predict_proba',
        n_jobs=-1
    )

    # Multi-output classifier
    multi_target_stack = MultiOutputClassifier(stack, n_jobs=-1)

    # Cross-validation evaluation
    print("\n=== Cross-Validation Results ===")
    cv_scores = []
    for i in range(y_train.shape[1]):
        scores = cross_val_score(
            multi_target_stack.estimator,  # Use the base estimator
            X_train,
            y_train[:, i],
            cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
            scoring='accuracy',
            n_jobs=-1
        )
        cv_scores.append(scores.mean())
        print(f"{mlb.classes_[i]} Accuracy: {scores.mean():.3f} (±{scores.std():.3f})")

    # Train on full training set
    multi_target_stack.fit(X_train, y_train)

    # Evaluation on holdout set
    y_pred = multi_target_stack.predict(X_eval)

    print("\n=== Holdout Set Evaluation ===")
    for i in range(y_eval.shape[1]):
        acc = accuracy_score(y_eval[:, i], y_pred[:, i])
        f1 = f1_score(y_eval[:, i], y_pred[:, i], average='macro')
        print(f"{mlb.classes_[i]} → Accuracy: {acc:.3f}, Macro-F1: {f1:.3f}")

    # Save all artifacts needed for future predictions
    save_artifacts(multi_target_stack, preprocessor, mlb)

# Predict and save predictions for the test set
def predict_and_save(test_data_path='test_data.csv', output_path='predictions.csv'):
    # Load and preprocess test data
    test_data = pd.read_csv(test_data_path, encoding='ISO-8859-1')
    test_data.columns = test_data.columns.str.replace('Ã©', 'é').str.strip().str.replace(' ', '_')
    test_data.rename(columns={'Moyenne_Lycée': 'Moyenne_Lycee', 'FiliÃ©re': 'Filiere',
                              'Projets_RealisÃ©s': 'Projets_Realises'}, inplace=True)
    test_data.columns = [unidecode(col).strip().replace(' ', '_') for col in test_data.columns]
    test_data = test_data[test_data['Filiere'].isin(['IIA', 'IMI', 'MPI', 'RT', 'GL', 'CH', 'BIO'])]
    test_data = test_data.drop(columns=['ID_Membre'])

    # Process Formations column
    test_data['Formations'] = test_data['Formations'].apply(
        lambda x: [f.strip() for f in str(x).split(',')] if isinstance(x, str) else [])
    test_data = test_data[test_data['Formations'].apply(len) > 0]

    # Load saved artifacts
    with open("formation_predictor_artifacts.pkl", "rb") as f:
        artifacts = pickle.load(f)
   
    model = artifacts['model']
    preprocessor = artifacts['preprocessor']
    mlb = artifacts['mlb']
   
    # Feature transformation on test data
    X_test_base = preprocessor.transform(test_data)

    # Predict on test data
    test_predictions = model.predict(X_test_base)

    # Inverse transform predictions
    test_pred_formations = mlb.inverse_transform(test_predictions)

    # Prepare results for saving
    results = pd.DataFrame({
        'ID_MEMBER': test_data['ID_Membre'],
        'Formations': ['; '.join(f) for f in test_pred_formations]
    })

    # Save the results to a CSV file
    results.to_csv(output_path, index=False)
    print(f"Predictions saved to {output_path}.")

# Run the training and saving artifacts
if __name__ == "__main__":
    main()

    # After training, you can call the prediction and saving function:
    predict_and_save()
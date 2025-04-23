# JCI Challenge - Formation Prediction Model

## Project Overview

This project trains a machine learning model to predict suitable Worshops recommendations for Junior Entreprise Insat (training courses or tracks) for individuals based on their profile data provided in `train_data.csv`. It employs a multi-label classification approach using an ensemble stacking model.

## Data

*   **Input File:** `train_data.csv` 
*   **Features:** Includes demographic information, academic background, skills, professional experience, club involvement, and internal evaluations.
*   **Target Variable:** `Formations` (A comma-separated string representing multiple possible training tracks, treated as a multi-label target).

## Preprocessing Steps

1.  **Load Data:** Reads the CSV file using pandas with `ISO-8859-1` encoding.
2.  **Clean Column Names:**
    *   Handles special characters (e.g., `Ã©` to `é`).
    *   Removes leading/trailing whitespace.
    *   Replaces spaces with underscores.
    *   Applies `unidecode` for broader character compatibility.
    *   Renames specific columns for clarity (e.g., `Moyenne_Lycée` to `Moyenne_Lycee`).
3.  **Filter Data:** Retains rows only for specific `Filiere` values (`IIA`, `IMI`, `MPI`, `RT`, `GL`, `CH`, `BIO`).
4.  **Drop Columns:** Removes the `ID_Membre` column.
5.  **Process Target Variable (`Formations`):**
    *   Splits the comma-separated string into a list of individual formations.
    *   Handles potential non-string entries.
    *   Removes rows where the `Formations` list is empty after processing.
6.  **Feature Engineering & Scaling:**
    *   **Categorical Features** (`Sexe`, `Filiere`, `Experience_Professionnelle`, `Cellule`): Encoded using `OneHotEncoder`.
    *   **Ordinal Features** (`Soft_Skills`, `Score_Entretien`): Encoded using `OrdinalEncoder`.
    *   **Numerical Features** (`Age`, `Moyenne_Lycee`, etc.): Scaled using `MinMaxScaler`.
    *   Uses `ColumnTransformer` to apply these transformations selectively.
7.  **Target Transformation:** The multi-label `Formations` column is binarized using `MultiLabelBinarizer`.
8.  **Final Feature Matrix:** The preprocessed features (`X_base`) are combined horizontally (`hstack`) with the binarized `Formations` features (`Y`) to create the final input matrix `X_final` for the model. *Note: This approach seems to include the target variable itself as features for predicting the target, which might lead to data leakage. Review this step if the goal is purely predictive.*

## Modeling

*   **Approach:** Multi-label classification.
*   **Model:** `MultiOutputClassifier` wrapping a `StackingClassifier`.
    *   **Base Learners:**
        *   `XGBClassifier` (objective: `binary:logistic`)
        *   `LGBMClassifier` (objective: `binary`)
    *   **Meta Learner:** `LogisticRegression`
    *   **Stacking Configuration:** Uses predicted probabilities (`stack_method='predict_proba'`) from base learners trained via 5-fold cross-validation.

## Evaluation

*   **Split:** The data (`X_final`, `Y`) is split into 80% training and 20% evaluation sets.
*   **Metrics:** The model's performance is evaluated on the evaluation set using:
    *   `accuracy_score` (per label)
    *   `f1_score` with `average='macro'` (per label)
*   Results are printed for each individual formation label.

## How to Run

1.  **Prerequisites:** Ensure you have Python installed along with the required libraries.
2.  **Dependencies:** Install the necessary packages:
    ```bash
    pip install numpy pandas scikit-learn xgboost lightgbm unidecode
    ```
3.  **Data:** Place the `train_data.csv` file in the same directory as the `train.py` script.
4.  **Execute:** Run the script from your terminal:
    ```bash
    python train.py
    ```
    The script will output the head of the preprocessed feature table, the head of the target matrix, and the evaluation metrics for each formation label.

## Dependencies

*   numpy
*   pandas
*   scikit-learn
*   xgboost
*   lightgbm
*   unidecode

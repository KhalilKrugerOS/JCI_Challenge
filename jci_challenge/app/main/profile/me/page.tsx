'use client';

import React, { useState } from 'react';
import axios from 'axios';

function Page() {
    const [memberInput, setMemberInput] = useState({
        age: '',
        sexe: '',
        moyenneLycee: '',
        filiere: '',
        autresClubs: '',
        projetsRealises: '',
        evaluationBureau: '',
        softSkills: '',
        scoreEntretien: '',
        experienceProfessionnelle: false,
        indiceEngagement: '',
        cellule: '',
    });

    const [predictedFormation, setPredictedFormation] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setMemberInput(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handlePredict = async () => {
        setError('');
        setPredictedFormation('');

        // Field checks
        if (isNaN(Number(memberInput.age))) return setError('Âge doit être un nombre');
        if (!['Homme', 'Femme'].includes(memberInput.sexe)) return setError('Sexe invalide');

        try {
            const res = await axios.post('/api/predictFormation', {
                age: Number(memberInput.age),
                sexe: memberInput.sexe,
                moyenneLycee: parseFloat(memberInput.moyenneLycee),
                filiere: memberInput.filiere,
                autresClubs: Number(memberInput.autresClubs),
                projetsRealises: Number(memberInput.projetsRealises),
                evaluationBureau: Number(memberInput.evaluationBureau),
                softSkills: parseFloat(memberInput.softSkills),
                scoreEntretien: parseFloat(memberInput.scoreEntretien),
                experienceProfessionnelle: memberInput.experienceProfessionnelle,
                indiceEngagement: parseFloat(memberInput.indiceEngagement),
                cellule: memberInput.cellule,
            });

            setPredictedFormation(res.data.prediction);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erreur inconnue');
        }
    };


    return (
        <div className="p-6 max-w-xl mx-auto mb-20">
            <h1 className="text-2xl font-bold mb-4">Profil du Membre</h1>

            {/* Age */}
            <div className="mb-3">
                <label className="block font-medium mb-1">Âge</label>
                <input
                    type="number"
                    name="age"
                    value={memberInput.age}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Sexe */}
            <div className="mb-3">
                <label className="block font-medium mb-1">Sexe</label>
                <select
                    name="sexe"
                    value={memberInput.sexe}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">-- Sélectionner --</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                </select>
            </div>

            {/* Other Inputs */}
            {[
                ['moyenneLycee', 'Moyenne Lycée'],
                ['filiere', 'Filière'],
                ['autresClubs', 'Autres Clubs'],
                ['projetsRealises', 'Projets Réalisés'],
                ['evaluationBureau', 'Évaluation Bureau'],
                ['softSkills', 'Soft Skills'],
                ['scoreEntretien', 'Score Entretien'],
                ['indiceEngagement', "Indice d'Engagement"],
                ['cellule', 'Cellule'],
            ].map(([name, label]) => (
                <div key={name} className="mb-3">
                    <label className="block font-medium mb-1">{label}</label>
                    <input
                        name={name}
                        value={(memberInput as any)[name]}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        type="text"
                    />
                </div>
            ))}

            {/* Experience Checkbox */}
            <div className="mb-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="experienceProfessionnelle"
                        checked={memberInput.experienceProfessionnelle}
                        onChange={handleChange}
                    />
                    Expérience Professionnelle
                </label>
            </div>

            {/* Button */}
            <button
                onClick={handlePredict}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
                Prédire la formation
            </button>

            {/* Result or Error */}
            {predictedFormation && (
                <div className="mt-6 text-green-600 font-semibold">
                    Formation Prédite : {predictedFormation}
                </div>
            )}
            {error && (
                <div className="mt-6 text-red-600 font-semibold">
                    Erreur : {error}
                </div>
            )}
        </div>
    );
}

export default Page;

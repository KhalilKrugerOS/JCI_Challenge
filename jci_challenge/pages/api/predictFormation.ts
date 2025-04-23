// pages/api/predictFormation.ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const {
        age,
        sexe,
        moyenneLycee,
        filiere,
        autresClubs,
        projetsRealises,
        evaluationBureau,
        softSkills,
        scoreEntretien,
        experienceProfessionnelle,
        indiceEngagement,
        cellule,
    } = req.body;

    try {
        const flaskRes = await axios.post('http://localhost:5000/predict', {
            age,
            sexe,
            moyenneLycee,
            filiere,
            autresClubs,
            projetsRealises,
            evaluationBureau,
            softSkills,
            scoreEntretien,
            experienceProfessionnelle,
            indiceEngagement,
            cellule,
        });

        return res.status(200).json({ prediction: flaskRes.data.prediction });
    } catch (err: any) {
        console.error('Erreur côté Flask:', err.message);
        return res.status(500).json({ error: 'Erreur côté Flask ou connexion impossible' });
    }
}

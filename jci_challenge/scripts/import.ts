const fs = require('fs');
const { parse } = require('csv-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

interface MemberCSV {
    ID_Membre: string;
    Age: string;
    Sexe: string;
    Moyenne_Lycée: string;
    Filiére: string;
    Autres_Clubs: string;
    Projets_Realisés: string;
    Evaluation_Bureau: string;
    Soft_Skills: string;
    Score_Entretien: string;
    Experience_Professionnelle: string;
    Indice_Engagement: string;
    Cellule: string;
    Formations: string;
}


async function importCSV() {
    const records: MemberCSV[] = [];
    const parser = fs
        .createReadStream('data/train_data.csv', { encoding: 'utf8' }) // <--- Add this
        .pipe(parse({
            columns: true,
            delimiter: ',', // Correct delimiter
            quote: '"',     // Enables support for quoted fields
            skip_empty_lines: true
        }))



    for await (const record of parser) {
        records.push(record);
    }

    for (const r of records) {
        await prisma.member.create({
            data: {
                age: parseInt(r.Age),
                sexe: r.Sexe,
                moyenneLycee: parseFloat(r['Moyenne_Lycée']),
                filiere: r['Filiére'],
                autresClubs: parseInt(r.Autres_Clubs),
                projetsRealises: parseInt(r['Projets_Realisés']),
                evaluationBureau: parseInt(r.Evaluation_Bureau),
                softSkills: parseFloat(r.Soft_Skills),
                scoreEntretien: parseFloat(r.Score_Entretien),
                experienceProfessionnelle: r.Experience_Professionnelle.toLowerCase() === 'true',
                indiceEngagement: parseFloat(r.Indice_Engagement),
                cellule: r.Cellule,
                formations: r.Formations,
            },
        });
    }

    console.log('✅ Done importing CSV');
    await prisma.$disconnect();
}

importCSV().catch((e) => {
    console.error(e);
    process.exit(1);
});
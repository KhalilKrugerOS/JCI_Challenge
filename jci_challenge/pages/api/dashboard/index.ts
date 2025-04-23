// pages/api/dashboard.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                if (req.query.action === 'cellDistribution') {
                    return await handleCellDistribution(req, res);
                }
                if (req.query.action === 'formationCount') {
                    return await handleFormationCount(req, res);
                }
                return res.status(400).json({ error: 'Action invalide' });

            case 'POST':
                if (req.body.action === 'addFormation') {
                    return await handleAddFormation(req, res);
                }
                return res.status(400).json({ error: 'Action invalide' });

            default:
                return res.status(405).json({ error: 'Méthode non autorisée' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Erreur serveur interne' });
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Handles fetching cell distribution data
 */
async function handleCellDistribution(req: NextApiRequest, res: NextApiResponse) {
    try {
        const distribution = await prisma.member.groupBy({
            by: ['cellule'],
            _count: {
                cellule: true,
            },
            orderBy: {
                _count: {
                    cellule: 'desc',
                },
            },
        });

        return res.status(200).json(distribution);
    } catch (error) {
        console.error('Cell Distribution Error:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération de la distribution des cellules' });
    }
}

/**
 * Handles fetching formation count data
 */
async function handleFormationCount(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fixed query - removed the problematic 'not: null' condition
        const members = await prisma.member.findMany({
            select: {
                formations: true,
            },
            where: {
                formations: {
                    not: '' // Use empty string instead of null
                }
            },
        });

        const formationCount: Record<string, number> = {};

        for (const member of members) {
            if (!member.formations) continue;

            const formationList = member.formations.split(',').map(f => f.trim()).filter(Boolean);

            for (const formation of formationList) {
                formationCount[formation] = (formationCount[formation] || 0) + 1;
            }
        }

        return res.status(200).json(formationCount);
    } catch (error) {
        console.error('Formation Count Error:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération du nombre de formations' });
    }
}

/**
 * Handles adding a new formation to a member
 */
async function handleAddFormation(req: NextApiRequest, res: NextApiResponse) {
    const { memberId, newFormation } = req.body;

    if (!memberId || !newFormation) {
        return res.status(400).json({ error: 'ID du membre et nom de la formation requis' });
    }

    try {
        // Find the member to get current formations
        const member = await prisma.member.findUnique({
            where: {
                id: memberId,
            },
            select: {
                formations: true,
            },
        });

        if (!member) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }

        // Parse current formations and add the new one
        const currentFormations = member.formations ? member.formations.split(',').map(f => f.trim()) : [];

        // Check if formation already exists
        if (currentFormations.includes(newFormation)) {
            return res.status(400).json({ error: 'Cette formation est déjà associée à ce membre' });
        }

        // Add new formation and join back to string
        currentFormations.push(newFormation);
        const updatedFormations = currentFormations.join(', ');

        // Update the member
        const updatedMember = await prisma.member.update({
            where: {
                id: memberId,
            },
            data: {
                formations: updatedFormations,
            },
        });

        return res.status(200).json(updatedMember);
    } catch (error) {
        console.error('Add Formation Error:', error);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout de la formation' });
    }
}
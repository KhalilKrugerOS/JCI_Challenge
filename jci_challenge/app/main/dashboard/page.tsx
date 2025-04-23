"use client"

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const DashboardPage = () => {
    // State for data management
    const [cellDistribution, setCellDistribution] = useState([]);
    const [formationCount, setFormationCount] = useState([]);
    const [newFormation, setNewFormation] = useState('');
    const [memberId, setMemberId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch cell distribution data
                const cellResponse = await fetch('/api/dashboard?action=cellDistribution');
                if (!cellResponse.ok) throw new Error('Failed to fetch cell distribution');
                const cellData = await cellResponse.json();

                // Transform data for chart
                const formattedCellData = cellData.map(item => ({
                    name: item.cellule,
                    value: item._count.cellule,
                }));
                setCellDistribution(formattedCellData);

                // Fetch formation count data
                const formationResponse = await fetch('/api/dashboard?action=formationCount');
                if (!formationResponse.ok) throw new Error('Failed to fetch formation counts');
                const formationData = await formationResponse.json();

                // Transform object to array for chart
                const formattedFormationData = Object.entries(formationData).map(([name, count]) => ({
                    name,
                    count,
                }));
                setFormationCount(formattedFormationData);

            } catch (err) {
                setError('Error loading dashboard data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Handle form submission to add a new formation
    const handleAddFormation = async (e) => {
        e.preventDefault();
        if (!newFormation.trim() || !memberId.trim()) {
            setError('Please provide both a formation name and member ID.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/dashboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'addFormation',
                    memberId: parseInt(memberId, 10),
                    newFormation: newFormation.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error adding formation');
            }

            // Reset form and show success message
            setNewFormation('');
            setMemberId('');
            setSuccessMessage('Formation ajoutée avec succès!');

            // Refresh data
            const formationResponse = await fetch('/api/dashboard?action=formationCount');
            const formationData = await formationResponse.json();
            const formattedFormationData = Object.entries(formationData).map(([name, count]) => ({
                name,
                count,
            }));
            setFormationCount(formattedFormationData);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Erreur lors de l\'ajout de la formation.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Display loading state
    if (loading && cellDistribution.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Tableau de Bord</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <span className="font-bold">Erreur:</span> {error}
                    <button
                        className="float-right text-red-700"
                        onClick={() => setError('')}
                    >
                        &times;
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {successMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Cell Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Répartition des Membres par Cellule</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={cellDistribution}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {cellDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} membres`, 'Quantité']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Formation Count Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Nombre de Formations par Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={formationCount}>
                            <XAxis dataKey="name" tick={{fontSize: 12}} height={60} interval={0} angle={-45} textAnchor="end" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} membres`, 'Participants']} />
                            <Legend />
                            <Bar dataKey="count" name="Nombre de participants" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Add Formation Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Ajouter une Formation</h2>
                <form onSubmit={handleAddFormation} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-1">
                                ID du Membre
                            </label>
                            <input
                                id="memberId"
                                type="number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                                placeholder="Entrez l'ID du membre"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="formation" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom de la Formation
                            </label>
                            <input
                                id="formation"
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={newFormation}
                                onChange={(e) => setNewFormation(e.target.value)}
                                placeholder="Entrez le nom de la formation"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : 'Ajouter la Formation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DashboardPage;
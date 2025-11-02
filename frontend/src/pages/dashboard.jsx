import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-react";
import GlassCard from '../components/GlassCard';
import UserProfileCard from '../components/UserProfileCard';
import RatingHistoryChart from '../components/RatingHistoryChart';
import SubmissionStatusChart from '../components/SubmissionStatusChart';
import LeaderboardC from '../components/LeaderboardC';





export default function Dashboard() {
    const { getToken, userId, isLoaded } = useAuth();

    // Set initial state to null or empty arrays
    const [currentUser, setCurrentUser] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // This is for data fetching
    const [error, setError] = useState(null);

    useEffect(() => {
        // Don't fetch data until the auth state is loaded
        if (!isLoaded) {
            return;
        }

        const fetchDashboardData = async (tokenProvider) => {
            setIsLoading(true);
            setError(null);


            const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';


            try {
                const token = await tokenProvider(); 

                // Fetch data based on User schema.
                const [meRes, leaderboardRes] = await Promise.all([
                    fetch(`${BASE_API_URL}/api/users/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${BASE_API_URL}/api/users/leaderboard`, { 
                        headers: { 'Authorization': `Bearer ${token}` } 
                    })
                ]);

                if (!meRes.ok || !leaderboardRes.ok) {
                    console.error("One or more API requests failed");
                    throw new Error('Failed to fetch all dashboard data.');
                }

                const meData = await meRes.json();
                const leaderboardData = await leaderboardRes.json();
                setCurrentUser(meData.user);
                setLeaderboard(leaderboardData.leaderboard);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || 'An unknown error occurred.');
                setCurrentUser({
                    username: 'Error',
                    rating: 0,
                    matches: [],
                    submissions: [], // Added
                    avatarUrl: 'https://placehold.co/128x128/000000/e00?text=ERR',
                    createdAt: new Date().toISOString() 
                });
                setLeaderboard([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData(getToken); 
    }, [isLoaded, getToken]); 

    if (!isLoaded) {
        return (
            <div className="relative flex justify-center items-center min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="text-cyan-400 text-2xl tracking-widest animate-pulse">
                    Loading User...
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col min-h-screen w-full text-slate-200 overflow-hidden">
            {/* Background */}
            <div
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center -z-10"
                style={{ backgroundImage: "url('/15.jpg')" }}
            ></div>


            {/* Page Header */}
            <header className="w-full p-6 mt-16 text-center ">
                <h1 className="text-5xl font-bold tracking-widest text-white text-shadow-lg">
                    USER DASHBOARD
                </h1>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow w-full max-w-7xl mx-auto p-6">
                {isLoading ? ( // This state is now for data fetching, not auth
                    // Loading State
                    <div className="flex justify-center items-center h-96">
                        <div className="text-cyan-400 text-2xl tracking-widest animate-pulse">
                            Loading Dashboard...
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-96">
                        <GlassCard className="p-8 text-center">
                            <h2 className="text-2xl text-red-500 mb-4 font-bold">Failed to Load Data</h2>
                            <p className="text-slate-300">{error}</p>
                        </GlassCard>
                    </div>
                ) : currentUser ? (
                    // Success State - Updated Layout
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Column 1: User Profile */}
                        <div className="lg:col-span-1">
                            <UserProfileCard user={currentUser} />
                        </div>

                        {/* Column 2: Chart and Leaderboard */}
                        <div className="lg:col-span-2 flex flex-col gap-6">

                            {/* RATING CHART ADDED */}
                            <RatingHistoryChart
                                submissions={currentUser.submissions}
                                userCreatedAt={currentUser.createdAt}
                            />

                            <SubmissionStatusChart submissions={currentUser.submissions} />

                        </div>

                    </div>
                ) : (
                    // Empty state
                    <div className="text-center text-slate-400">No data found.</div>
                )}
            </main>

            <footer className="w-full p-4 text-center text-slate-400">
                © 2025 Battle IDE. All rights reserved.
            </footer>
        </div>
    );
}


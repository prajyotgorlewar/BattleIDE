import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-react";

import LeaderboardC from '../components/LeaderboardC';
import { Award } from 'lucide-react';





export default function Leaderboard() {
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
            <div className="relative flex justify-center items-center min-h-screen w-full overflow-hidden font-sans bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="text-cyan-400 text-2xl tracking-widest animate-pulse">
                    Loading User...
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center min-h-screen w-full font-sans">
            {/* Background */}
            <div
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center -z-10"
                style={{ backgroundImage: "url('/15.jpg')" }}
            >
            </div>
            <LeaderboardC users={leaderboard} currentUser={currentUser} />

        </div>
    );
}


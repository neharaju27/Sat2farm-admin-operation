import React, { useState, useEffect } from 'react';
import { fetchFarmData, isAuthenticated, requireAuth } from '../api/farmApi';

const FarmDataFetcher = ({ farmId }) => {
    const [farmData, setFarmData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check authentication before fetching data
        if (!requireAuth()) {
            return;
        }

        const getFarmData = async () => {
            if (!farmId) return;

            setLoading(true);
            setError(null);

            try {
                const data = await fetchFarmData(farmId);
                setFarmData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getFarmData();
    }, [farmId]);

    if (loading) return <div>Loading farm data...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!farmData) return <div>No farm data available</div>;

    return (
        <div className="farm-data">
            <h3>Farm Information</h3>
            <div className="farm-details">
                <p><strong>Farm ID:</strong> {farmData.farm_id}</p>
                <p><strong>Status:</strong> {farmData.message}</p>
                {farmData.success && (
                    <div className="success-message">
                        ✅ Access granted to farm {farmData.farm_id}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmDataFetcher;

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';

export default function Dashboard() {
    const [analytics, setAnalytics] = useState({ queryLogs: [], ratings: [] });

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/get-analytics');
            const data = await response.json();
            setAnalytics(data);
        };

        fetchData();
    }, []);

    const queryData = {
        labels: analytics.queryLogs.map(log => new Date(log.timestamp).toLocaleString()),
        datasets: [{
            label: 'User Queries',
            data: analytics.queryLogs.map(log => log.query.length),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }]
    };

    const ratingData = {
        labels: ['Helpful', 'Not Helpful'],
        datasets: [{
            label: 'Ratings',
            data: [
                analytics.ratings.filter(r => r.rating === 'helpful').length,
                analytics.ratings.filter(r => r.rating === 'not helpful').length,
            ],
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        }]
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>AI Support Analytics Dashboard</Typography>
            <Typography variant="h6">User Queries Over Time</Typography>
            <Chart type="line" data={queryData} />
            <Typography variant="h6" mt={4}>Response Ratings</Typography>
            <Chart type="bar" data={ratingData} />
        </Box>
    );
}
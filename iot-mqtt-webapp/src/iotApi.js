const apiBaseUrl = 'https://your-iot-api-url.com';

export async function getSensorData() {
    const response = await fetch(`${apiBaseUrl}/sensor-data`);
    if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
    }
    return await response.json();
}

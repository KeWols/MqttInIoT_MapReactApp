import React, { useEffect, useState } from 'react';
import { getSensorData } from '../iotApi';

const IoTDataComponent = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        getSensorData()
            .then((response) => setData(response))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div>
            <h1>IoT Sensor Data</h1>
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default IoTDataComponent;

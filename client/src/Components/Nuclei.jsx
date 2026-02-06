import React from 'react';

export default function RunNuclei() {
    const handleButtonClick = async () => {
        try {
            const response = await fetch('http://localhost:5000/run-script', {
                method: 'POST',
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <button onClick={handleButtonClick}>Run Script</button>
    );
}

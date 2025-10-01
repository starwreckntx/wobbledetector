# Foundry Centrifuge Wobble Detector

A computer vision diagnostic app that monitors a foundry centrifuge's wheels for wobble and imbalance. It uses a device camera to track reflective tape on each wheel, calculates real-time deviation, and uses the Google Gemini API to provide diagnostic insights.

## Features

- **Real-time Video Analysis**: Directly processes the feed from your device's camera.
- **Wobble Detection**: Uses computer vision to track reflective markers on each centrifuge wheel and calculates rotational deviation in real-time.
- **Dynamic Dashboard**: Displays live status for each detected wheel, including wobble measurement (in mm) and a clear status indicator (OK, Warning, Alert).
- **AI-Powered Diagnosis**: Leverages the Google Gemini API to analyze the collected data and provide expert-level diagnosis, potential causes, and recommended actions.
- **Configurable Settings**: Easily adjust parameters like brightness threshold for marker detection, wobble tolerance, and calibration values through a user-friendly modal.
- **Responsive Design**: A clean, modern interface that works across different screen sizes.

## How It Works

1.  **Camera Feed**: The application accesses a device camera using the `getUserMedia` API.
2.  **Frame Processing**: Each video frame is drawn onto an HTML5 `<canvas>`.
3.  **Marker Detection**: The canvas pixel data is scanned to identify bright spots, which correspond to reflective tape on the centrifuge wheels. A simple blob detection algorithm groups these pixels to find the center of each marker.
4.  **Tracking**: A tracking algorithm follows the detected markers from frame to frame, recording their path.
5.  **Wobble Calculation**: By analyzing the path of a marker, the application determines the center of its rotation and calculates the deviation between the minimum and maximum radius. This deviation is the "wobble".
6.  **AI Analysis**: The calculated wobble data for all wheels is sent to the Google Gemini API. A specialized prompt instructs the model to act as a mechanical engineer, analyze the data, and provide a concise diagnosis and action plan.
7.  **Display**: The live data and the AI diagnosis are presented to the user on the dashboard.

## Getting Started

This is a self-contained web application that runs directly in the browser.

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge).
- A device with a camera.
- A valid Google Gemini API key.

### Running the Application

1.  **Set up the API Key**: This application requires a Google Gemini API key to be available as an environment variable named `API_KEY`. Ensure this variable is set in the environment where you are serving the files.
2.  **Serve the files**: You can use a simple local web server to run the application. For example, using Python:
    ```bash
    python -m http.server
    ```
    Or with Node.js:
    ```bash
    npx serve
    ```
3.  **Open in Browser**: Navigate to the local server's address (e.g., `http://localhost:8000`) in your web browser.

## Configuration

The application's detection parameters can be configured by clicking the **Settings** (cog) icon in the header.

- **Brightness Threshold**: The brightness level (0-255) used to identify the reflective tape. Higher values are more selective.
- **Wobble Tolerance (mm)**: The maximum allowed wobble in millimeters before a wheel's status changes to "Alert".
- **Pixels per Millimeter**: A crucial calibration value. To set this, measure a known physical length in the camera's view and find its corresponding length in pixels on the screen.
- **Max Wheels to Track**: The maximum number of wheels the system will attempt to track simultaneously.
- **Tracking History Length**: The number of past frames to use when calculating the wobble. A higher number provides a smoother but slightly delayed reading.

## Technology Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **AI**: Google Gemini API (`@google/genai`)
- **Browser APIs**: HTML5 Canvas, WebRTC (`getUserMedia`)

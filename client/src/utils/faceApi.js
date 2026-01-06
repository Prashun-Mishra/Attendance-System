import * as faceapi from 'face-api.js';

export const loadModels = async () => {
    const MODEL_URL = '/models';
    try {
        console.log("Starting model load...");
        await Promise.all([
            faceapi.loadSsdMobilenetv1Model(MODEL_URL),
            faceapi.loadFaceLandmarkModel(MODEL_URL),
            faceapi.loadFaceRecognitionModel(MODEL_URL),
        ]);
        console.log("Models loaded successfully");
    } catch (error) {
        console.error("Error loading models:", error);
        throw error;
    }
};

export const getFaceDescriptor = async (videoElement) => {
    const detections = await faceapi.detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detections;
};

// EAR (Eye Aspect Ratio) calculation for blink detection
export const getEAR = (landmarks) => {
    // Calculate euclidean distance between two points
    const distance = (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getEyeEAR = (eye) => {
        // eye is an array of 6 points {x, y}
        // EAR formula: (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
        const A = distance(eye[1], eye[5]);
        const B = distance(eye[2], eye[4]);
        const C = distance(eye[0], eye[3]);
        return (A + B) / (2.0 * C);
    };

    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    if (!leftEye || !rightEye || leftEye.length < 6 || rightEye.length < 6) {
        console.error("Invalid eye landmarks");
        return 0.5; // Default value when eyes open
    }

    const leftEAR = getEyeEAR(leftEye);
    const rightEAR = getEyeEAR(rightEye);

    return (leftEAR + rightEAR) / 2.0;
};

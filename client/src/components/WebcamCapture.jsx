import React, { useRef } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onUserMedia, videoRef, width = 640, height = 480 }) => {
    return (
        <div className="relative rounded-lg overflow-hidden shadow-lg">
            <Webcam
                audio={false}
                ref={videoRef}
                screenshotFormat="image/jpeg"
                onUserMedia={onUserMedia}
                videoConstraints={{
                    width,
                    height,
                    facingMode: "user"
                }}
                className="w-full h-auto"
            />
        </div>
    );
};

export default WebcamCapture;

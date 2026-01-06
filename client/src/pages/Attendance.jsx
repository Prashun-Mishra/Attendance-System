import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { loadModels, getEAR } from '../utils/faceApi';
import { UserCheck, AlertTriangle } from 'lucide-react';
import API_URL from '../config/api';

const Attendance = () => {
    const webcamRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, BLINK_DETECTED, MATCHED, ERROR
    const [message, setMessage] = useState('Initializing...');
    const [students, setStudents] = useState([]);
    const [labeledDescriptors, setLabeledDescriptors] = useState([]);

    // Config
    const BLINK_THRESHOLD = 0.3; // EAR threshold (increased for better detection)
    const MATCH_THRESHOLD = 0.6;

    useEffect(() => {
        const setup = async () => {
            await loadModels();
            try {
                // Load all students for recognition
                const res = await axios.get('http://localhost:5000/api/students');
                setStudents(res.data);

                // Pre-calculate labeled descriptors
                const descriptors = res.data
                    .filter(s => s.faceDescriptor)
                    .map(s => new faceapi.LabeledFaceDescriptors(
                        s.rollNo,
                        [new Float32Array(s.faceDescriptor)]
                    ));

                setLabeledDescriptors(descriptors);
                setModelsLoaded(true);
                setStatus('SCANNING');
                setMessage('Scanning... Please ensure good lighting.');
            } catch (error) {
                console.error("Setup error", error);
                setMessage('Error loading data.');
            }
        };
        setup();
    }, []);

    useEffect(() => {
        if (!modelsLoaded || status === 'SUCCESS') return;

        let interval;
        let blinkDetected = false;

        const detect = async () => {
            if (!webcamRef.current?.video) return;

            const video = webcamRef.current.video;
            if (video.paused || video.ended) return;

            try {
                const detections = await faceapi.detectSingleFace(video)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (!detections) {
                    setMessage('No face detected.');
                    return;
                }

                // Liveness Check: Blink Detection
                if (!blinkDetected) {
                    const ear = getEAR(detections.landmarks);
                    console.log("EAR:", ear.toFixed(3), "| Threshold:", BLINK_THRESHOLD);

                    if (ear < BLINK_THRESHOLD) {
                        blinkDetected = true; // Eyes closed
                        setMessage('Blink detected! Verifying identity...');
                    } else {
                        setMessage('Please BLINK to verify liveness.');
                        return; // Wait for blink
                    }
                }

                // Recognition (Only if blink passed)
                if (blinkDetected && labeledDescriptors.length > 0) {
                    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, MATCH_THRESHOLD);
                    const bestMatch = faceMatcher.findBestMatch(detections.descriptor);

                    if (bestMatch.label !== 'unknown') {
                        const student = students.find(s => s.rollNo === bestMatch.label);
                        if (student) {
                            await markAttendance(student);
                        }
                    } else {
                        setMessage('Unknown face. Registered?');
                        blinkDetected = false; // Reset to try again
                    }
                }

            } catch (err) {
                if (status !== 'SUCCESS') console.error(err);
            }
        };

        interval = setInterval(detect, 500); // Check every 500ms
        return () => clearInterval(interval);
    }, [modelsLoaded, students, labeledDescriptors, status]);

    const markAttendance = async (student) => {
        setStatus('SUCCESS');
        setMessage(`Welcome, ${student.fullName}! Attendance Marked.`);

        try {
            await axios.post('http://localhost:5000/api/attendance', {
                studentId: student.id,
                status: 'Present'
            });
            // Reset after 3 seconds
            setTimeout(() => {
                setStatus('SCANNING');
                setMessage('Scanning...');
            }, 3000);
        } catch (error) {
            setMessage(`Error marking attendance: ${error.response?.data?.message}`);
            setTimeout(() => {
                setStatus('SCANNING');
            }, 3000);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">Smart Attendance</h2>
                <p className="text-gray-500 text-lg">AI-Powered Face Recognition System</p>
            </div>

            <div className="relative mx-auto w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl glass border-4 border-white">
                <div className="aspect-video bg-black relative overflow-hidden group">
                    {modelsLoaded ? (
                        <>
                            <Webcam
                                ref={webcamRef}
                                className="w-full h-full object-cover transform scale-x-[-1]" // CSS flip
                                audio={false}
                                screenshotFormat="image/jpeg"
                            />
                            {/* Scan Line Animation */}
                            {status === 'SCANNING' && (
                                <div className="absolute top-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-scan opacity-50"></div>
                            )}

                            {/* Status Overlay */}
                            <div className={`absolute inset-x-0 bottom-0 p-6 backdrop-blur-md transition-colors duration-500 ease-in-out border-t border-white/10
                                ${status === 'SUCCESS' ? 'bg-green-500/90' : 'bg-black/60'}
                             `}>
                                <div className="flex items-center justify-center gap-4 text-white">
                                    <div className={`p-3 rounded-full ${status === 'SUCCESS' ? 'bg-white text-green-600' : 'bg-white/10'}`}>
                                        {status === 'SUCCESS' ? <UserCheck size={32} /> : <AlertTriangle size={24} />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-2xl font-bold leading-tight">
                                            {status === 'SUCCESS' ? 'Authenticated' :
                                                status === 'BLINK_DETECTED' ? 'Verifying...' : 'Scanning'}
                                        </p>
                                        <p className="text-sm opacity-90">{message}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white space-y-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="text-lg font-medium animate-pulse">Initializing Neural Networks...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Look Straight', desc: 'Position your face in the center', color: 'bg-blue-50' },
                    { title: 'Good Lighting', desc: 'Ensure your face is well lit', color: 'bg-yellow-50' },
                    { title: 'Blink Naturally', desc: 'Blink to prove liveness', color: 'bg-green-50' }
                ].map((item, idx) => (
                    <div key={idx} className={`${item.color} p-6 rounded-2xl text-center shadow-sm border border-black/5`}>
                        <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Attendance;

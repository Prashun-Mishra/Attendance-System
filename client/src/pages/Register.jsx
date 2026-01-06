import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { loadModels, getFaceDescriptor } from '../utils/faceApi';
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import API_URL from '../config/api';

const Register = () => {
    const webcamRef = useRef(null);
    const [fullName, setFullName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [message, setMessage] = useState(null);
    const [descriptor, setDescriptor] = useState(null);

    useEffect(() => {
        const initModels = async () => {
            await loadModels();
            setModelsLoaded(true);
        };
        initModels();
    }, []);

    const captureAndDetect = async () => {
        if (!webcamRef.current || !modelsLoaded) return;

        try {
            setLoading(true);
            const imageSrc = webcamRef.current.getScreenshot();
            const img = await faceapi.fetchImage(imageSrc);

            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

            if (detections) {
                setDescriptor(Array.from(detections.descriptor));
                setMessage({ type: 'success', text: 'Face detected! You can now register.' });
            } else {
                setMessage({ type: 'error', text: 'No face detected. Please try again.' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Detection failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!descriptor) return;

        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/students`, {
                fullName,
                rollNo,
                faceDescriptor: descriptor
            });
            setMessage({ type: 'success', text: 'Student registered successfully!' });
            setFullName('');
            setRollNo('');
            setDescriptor(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-10 items-start">
            {/* Left Column: Camera */}
            <div className="flex-1 w-full space-y-6">
                <div className="glass p-6 rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-800">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Camera size={24} />
                        </div>
                        Face Capture
                    </h2>

                    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video mb-6 ring-4 ring-gray-100 shadow-inner">
                        {modelsLoaded ? (
                            <Webcam
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover transform scale-x-[-1]"
                                audio={false}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                <span className="animate-pulse">Loading Models...</span>
                            </div>
                        )}

                        {/* Face Frame Overlay */}
                        <div className="absolute inset-0 border-2 border-white/20 m-8 rounded-xl pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                        </div>
                    </div>

                    <button
                        onClick={captureAndDetect}
                        disabled={loading || !modelsLoaded}
                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Capture Face'}
                    </button>

                    {message && (
                        <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="flex-1 w-full">
                <form onSubmit={handleRegister} className="glass p-8 rounded-3xl shadow-xl h-full flex flex-col justify-center">
                    <div className="mb-8">
                        <h3 className="text-3xl font-extrabold text-gray-800 mb-2">New Registration</h3>
                        <p className="text-gray-500">Enter student details and link their face ID.</p>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Roll Number</label>
                            <input
                                type="text"
                                value={rollNo}
                                onChange={(e) => setRollNo(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                                placeholder="e.g. CS-2024-001"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!descriptor || loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
                    >
                        Register Student
                    </button>

                    {!descriptor && (
                        <p className="text-sm text-amber-600 mt-4 text-center bg-amber-50 py-2 rounded-lg border border-amber-100 flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> Please capture face above before registering
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Register;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import '../../styles/create-food.css';
import { useNavigate } from 'react-router-dom';

const CreateFood = () =>
{
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [videoURL, setVideoURL] = useState('');
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() =>
    {
        if (!videoFile) {
            setVideoURL('');
            return;
        }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    const onFileChange = (e) =>
    {
        const file = e.target.files?.[0];
        if (!file) return setVideoFile(null);
        if (!file.type.startsWith('video/')) {
            setFileError('Please select a valid video file.');
            return;
        }
        setFileError('');
        setVideoFile(file);
    };

    const onDrop = (e) =>
    {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setFileError('Please drop a valid video file.');
            return;
        }
        setFileError('');
        setVideoFile(file);
    };

    const onDragOver = (e) => e.preventDefault();

    const openFileDialog = () => fileInputRef.current?.click();

    const onSubmit = async (e) =>
    {
        e.preventDefault();
        if (!videoFile) return setFileError('Video file is required');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('video', videoFile); // must match backend's Multer field

        try {
            const response = await axios.post(
                'http://localhost:3000/api/food',
                formData,
                { withCredentials: true }
            );
            console.log('[LOG] Food created:', response.data);
            navigate('/');
        } catch (error) {
            console.error('[ERROR] Failed to create food:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Failed to create food');
        }
    };

    const isDisabled = useMemo(() => !name.trim() || !videoFile, [name, videoFile]);

    return (
        <div className="create-food-page">
            <div className="create-food-card">
                <header className="create-food-header">
                    <h1>Create Food</h1>
                    <p>Upload a short video, give it a name, and add a description.</p>
                </header>

                <form className="create-food-form" onSubmit={onSubmit}>
                    <div className="field-group">
                        <label htmlFor="foodVideo">Food Video</label>
                        <input
                            id="foodVideo"
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="file-input-hidden"
                            onChange={onFileChange}
                        />

                        <div
                            className="file-dropzone"
                            role="button"
                            tabIndex={0}
                            onClick={openFileDialog}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        >
                            <strong>Tap to upload</strong> or drag and drop
                        </div>

                        {fileError && <p className="error-text">{fileError}</p>}

                        {videoFile && (
                            <div className="file-chip">
                                <span>{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                                <button type="button" onClick={() => setVideoFile(null)}>Remove</button>
                            </div>
                        )}
                    </div>

                    {videoURL && (
                        <div className="video-preview">
                            <video src={videoURL} controls />
                        </div>
                    )}

                    <div className="field-group">
                        <label htmlFor="foodName">Name</label>
                        <input
                            id="foodName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Spicy Paneer Wrap"
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="foodDesc">Description</label>
                        <textarea
                            id="foodDesc"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description"
                        />
                    </div>

                    <button className="btn-primary" type="submit" disabled={isDisabled}>
                        Save Food
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFood;

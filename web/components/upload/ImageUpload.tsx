'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '@/services/uploadService';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    onImageUploaded: (url: string, publicId: string) => void;
    maxFiles?: number;
}

export default function ImageUpload({ onImageUploaded, maxFiles = 4 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Add previews
        const newPreviews = acceptedFiles.map(file => ({
            url: URL.createObjectURL(file),
            file
        }));
        setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));

        // Upload files
        setUploading(true);
        try {
            for (const file of acceptedFiles) {
                const response = await uploadImage(file, 'post');
                if (response.success && response.data) {
                    onImageUploaded(response.data.url, response.data.publicId);
                }
            }
        } catch (error: any) {
            alert(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    }, [onImageUploaded, maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxFiles,
        disabled: uploading || previews.length >= maxFiles
    });

    const removePreview = (index: number) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {/* Dropzone */}
            {previews.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    {isDragActive ? (
                        <p className="text-blue-600 font-medium">Drop images here...</p>
                    ) : (
                        <>
                            <p className="text-gray-600 font-medium mb-1">
                                Click or drag images to upload
                            </p>
                            <p className="text-sm text-gray-500">
                                PNG, JPG, GIF up to 10MB ({maxFiles - previews.length} remaining)
                            </p>
                        </>
                    )}
                    {uploading && (
                        <p className="text-sm text-blue-600 mt-2">Uploading...</p>
                    )}
                </div>
            )}

            {/* Previews */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={preview.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => removePreview(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

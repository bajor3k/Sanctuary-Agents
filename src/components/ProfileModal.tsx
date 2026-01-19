"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Wand2, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
    firstName: string;
    lastName: string;
    breakDate: string;
    photoUrl: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, userProfile, updateProfile } = useAuth();
    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        breakDate: '',
        photoUrl: '',
    });
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const { toast } = useToast();

    const handleGenerateAIAvatar = async () => {
        if (!photoPreview) return;

        setIsGeneratingAvatar(true);
        try {
            const response = await fetch('/api/generate-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: photoPreview }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate avatar');
            }

            const data = await response.json();
            if (data.avatarUrl) {
                setPhotoPreview(data.avatarUrl);
                setProfileData(prev => ({ ...prev, photoUrl: data.avatarUrl }));
                toast({
                    title: 'Success',
                    description: 'AI Avatar generated successfully!',
                });
            }
        } catch (error: any) {
            console.error('Error generating AI avatar:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to generate AI avatar',
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingAvatar(false);
        }
    };


    // Load profile data from context when it changes or modal opens
    useEffect(() => {
        if (isOpen && userProfile) {
            setProfileData({
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                breakDate: userProfile.breakDate,
                photoUrl: userProfile.photoUrl
            });
            setPhotoPreview(userProfile.photoUrl || '');
        }
    }, [isOpen, userProfile]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPhotoPreview(result);
                setProfileData(prev => ({ ...prev, photoUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (user) {
            updateProfile(profileData);
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-lg my-auto bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-2xl font-semibold">My Profile</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full hover:bg-accent"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Upload className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Label
                                htmlFor="photo-upload"
                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <Upload className="h-4 w-4" />
                                Upload Photo
                            </Label>
                            <Input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleGenerateAIAvatar}
                                disabled={isGeneratingAvatar || !photoPreview}
                                className="gap-2"
                            >
                                <Wand2 className="h-4 w-4" />
                                {isGeneratingAvatar ? 'Generating...' : 'AI Avatar'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Upload a photo then click "AI Avatar" to create a professional cartoon version
                        </p>
                    </div>

                    {/* First and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First</Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="First name"
                                value={profileData.firstName}
                                onChange={(e) =>
                                    setProfileData(prev => ({ ...prev, firstName: e.target.value }))
                                }
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last</Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Last name"
                                value={profileData.lastName}
                                onChange={(e) =>
                                    setProfileData(prev => ({ ...prev, lastName: e.target.value }))
                                }
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Break Date */}
                    <div className="space-y-2">
                        <Label htmlFor="breakDate">Break Date</Label>
                        <div className="relative">
                            <Input
                                id="breakDate"
                                type="date"
                                value={profileData.breakDate}
                                onChange={(e) =>
                                    setProfileData(prev => ({ ...prev, breakDate: e.target.value }))
                                }
                                className="w-full"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/20">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Profile
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}

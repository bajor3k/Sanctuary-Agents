"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Shuffle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

interface AvatarCreatorProps {
    onAvatarGenerated: (avatarUrl: string) => void;
    currentAvatar?: string;
}

const avatarStyles = [
    { id: 'avataaars', name: 'Cartoon' },
    { id: 'bottts', name: 'Robot' },
    { id: 'pixel-art', name: 'Pixel Art' },
    { id: 'lorelei', name: 'Illustrated' },
    { id: 'thumbs', name: 'Thumbs' },
    { id: 'fun-emoji', name: 'Fun Emoji' },
    { id: 'adventurer', name: 'Adventurer' },
    { id: 'big-smile', name: 'Big Smile' },
];

export function AvatarCreator({ onAvatarGenerated, currentAvatar }: AvatarCreatorProps) {
    const [selectedStyle, setSelectedStyle] = useState(avatarStyles[0].id);
    const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAvatar = () => {
        setIsGenerating(true);
        try {
            // Generate random seed for avatar
            const seed = Math.random().toString(36).substring(7) + Date.now();

            // DiceBear API URL - directly use as image src
            const apiUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}&size=128`;

            setPreviewUrl(apiUrl);
            onAvatarGenerated(apiUrl);
        } catch (error) {
            console.error('Error generating avatar:', error);
            alert('Failed to generate avatar. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
                {/* Preview */}
                {previewUrl && (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                        <img
                            src={previewUrl}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="w-full space-y-2">
                    <Label className="text-sm">Avatar Style</Label>
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a style" />
                        </SelectTrigger>
                        <SelectContent className="z-[99999]">
                            {avatarStyles.map((style) => (
                                <SelectItem key={style.id} value={style.id}>
                                    {style.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={generateAvatar}
                    className="w-full gap-2"
                    variant="secondary"
                    disabled={isGenerating}
                >
                    <Shuffle className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Avatar'}
                </Button>
            </div>
        </div>
    );
}

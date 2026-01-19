// Utility functions for managing user profile data

export interface ProfileData {
    firstName: string;
    lastName: string;
    breakDate: string;
    photoUrl: string;
}

const DEFAULT_PROFILE: ProfileData = {
    firstName: '',
    lastName: '',
    breakDate: '',
    photoUrl: '',
};

export function getProfileData(uid: string): ProfileData {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;

    try {
        const savedProfile = localStorage.getItem(`profile_${uid}`);
        if (savedProfile) {
            return JSON.parse(savedProfile);
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
    }

    return DEFAULT_PROFILE;
}

export function saveProfileData(uid: string, data: ProfileData): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(`profile_${uid}`, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving profile data:', error);
    }
}

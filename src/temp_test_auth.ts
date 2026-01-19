import { useAuth } from "@/contexts/auth-context";

export function useUserName() {
    const { user } = useAuth();
    if (user && user.displayName) {
        // extract first name if desired, or use full display name
        const firstName = user.displayName.split(' ')[0];
        return firstName;
    }
    return null;
}

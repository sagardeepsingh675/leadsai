import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getUserProfile, isUserAdmin } from '../lib/supabase';
import type { UserProfile } from '../lib/database.types';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Helper function to create profile if it doesn't exist
    const ensureProfileExists = async (userId: string, email: string, fullName?: string) => {
        // First try to get existing profile
        const { data: existingProfile, error: fetchError } = await getUserProfile(userId);

        if (existingProfile) {
            return existingProfile;
        }

        // Profile doesn't exist, create it
        if (fetchError || !existingProfile) {
            console.log('Profile not found, creating new profile...');
            const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                    id: userId,
                    email: email,
                    full_name: fullName || '',
                    subscription_tier: 'free_trial',
                    subscription_status: 'active',
                    subscription_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating profile:', insertError);
                // Try to fetch again in case of race condition
                const { data: retryProfile } = await getUserProfile(userId);
                return retryProfile;
            }

            return newProfile as UserProfile;
        }

        return null;
    };

    const fetchProfile = async (userId: string, email?: string, fullName?: string) => {
        // Try to get or create profile
        const profileData = await ensureProfileExists(userId, email || '', fullName);

        if (profileData) {
            setProfile(profileData);
            const adminStatus = await isUserAdmin(userId);
            setIsAdmin(adminStatus);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id, user.email || '');
        }
    };

    useEffect(() => {
        // Timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn('Auth loading timeout - forcing complete');
                setLoading(false);
            }
        }, 5000);

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email || '');
            }
            setLoading(false);
        }).catch((error) => {
            console.error('Auth session error:', error);
            setLoading(false);
        });

        return () => clearTimeout(timeout);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (event === 'SIGNED_IN' && session?.user) {
                    const fullName = session.user.user_metadata?.full_name;
                    await fetchProfile(session.user.id, session.user.email || '', fullName);
                } else if (event === 'SIGNED_OUT') {
                    setProfile(null);
                    setIsAdmin(false);
                }

                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                },
            });

            if (error) throw error;

            // If user was created and confirmed (no email verification), create profile manually
            if (data.user && !data.user.confirmation_sent_at) {
                await ensureProfileExists(data.user.id, email, fullName);
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                isAdmin,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;

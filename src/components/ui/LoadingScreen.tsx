import { Zap } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Zap className="w-8 h-8 text-white" />
                </div>
                <p className="text-dark-400">Loading...</p>
            </div>
        </div>
    );
}

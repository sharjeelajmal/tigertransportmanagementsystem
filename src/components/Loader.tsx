'use client';

import { motion } from 'framer-motion';

interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullScreen?: boolean;
}

export default function Loader({ className = '', size = 'md', fullScreen = false }: LoaderProps) {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const loaderContent = (
        <div className={`relative flex items-center justify-center ${className}`}>
            <motion.div
                className={`${sizes[size]} rounded-full border-4 border-gray-200`}
            />
            <motion.div
                className={`absolute top-0 left-0 ${sizes[size]} rounded-full border-4 border-transparent`}
                style={{ borderTopColor: "var(--primary)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner dot for extra flair */}
            {size !== 'sm' && (
                <motion.div
                    className="absolute rounded-full w-2 h-2"
                    style={{ background: "var(--primary)" }}
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
}

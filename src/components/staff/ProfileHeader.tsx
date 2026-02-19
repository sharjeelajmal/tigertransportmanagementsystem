'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProfileHeaderProps {
    firstName: string;
    lastName: string;
    designation: string;
    photo?: string;
}

const ProfileHeader = ({ firstName, lastName, designation, photo }: ProfileHeaderProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl mb-8 group"
            style={{ minHeight: '220px' }}
        >
            {/* ── Modern Background Pattern ── */}
            <div className="absolute inset-0 bg-[#B50104]" />
            <div className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.2) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(0,0,0,0.2) 0%, transparent 20%)',
                    backgroundSize: '100% 100%'
                }}
            />
            {/* Abstract Shapes */}
            <div className="absolute top-[-50%] left-[-10%] w-[80%] h-[200%] bg-gradient-to-br from-white/10 to-transparent transform rotate-12 blur-3xl rounded-full mix-blend-overlay" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[150%] bg-gradient-to-tl from-black/20 to-transparent transform -rotate-12 blur-2xl rounded-full mix-blend-multiply" />
            <div className="absolute top-0 right-0 w-full h-full opacity-10"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between h-full p-8 md:p-10">

                {/* Text Content */}
                <div className="text-white mb-6 md:mb-0 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-2"
                    >
                        {firstName} {lastName}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-lg md:text-xl font-medium opacity-90"
                    >
                        {designation}
                    </motion.p>
                </div>

                {/* Profile Image — only if photo provided */}
                {photo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
                        className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-white/30 shadow-2xl flex-shrink-0"
                    >
                        <Image
                            src={photo}
                            alt={`${firstName} ${lastName}`}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default ProfileHeader;

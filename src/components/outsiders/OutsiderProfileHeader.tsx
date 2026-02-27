'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import ProfileHeader from '@/components/staff/ProfileHeader';
import { IOutsider } from '@/models/Outsider';

interface OutsiderProfileHeaderProps {
    outsider: IOutsider;
    activeTab: 'profile' | 'allocations';
    outsiderId: string;
    onEditClick?: () => void;
}

const OutsiderProfileHeader = ({ outsider, activeTab, outsiderId, onEditClick }: OutsiderProfileHeaderProps) => {
    const router = useRouter();
    return (
        <div className="space-y-4 md:space-y-8">
            <ProfileHeader
                firstName={outsider.outsiderName}
                lastName=""
                designation={outsider.category}
                photo={undefined}
            />

            {/* Tabs + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 md:pb-4">
                <div className="flex gap-4 md:gap-6">
                    <button
                        onClick={() => router.push(`/dashboard/outsiders/${outsiderId}`)}
                        className={`text-xs md:text-sm font-bold transition-all relative pb-2 cursor-pointer ${activeTab === 'profile' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Profile
                        {activeTab === 'profile' && (
                            <motion.div layoutId="activeTab" className="absolute -bottom-[13px] md:-bottom-[17px] left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard/outsiders/${outsiderId}/allocations`)}
                        className={`text-xs md:text-sm font-bold transition-all relative pb-2 cursor-pointer ${activeTab === 'allocations' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Allocations
                        {activeTab === 'allocations' && (
                            <motion.div layoutId="activeTab" className="absolute -bottom-[13px] md:-bottom-[17px] left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full" />
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    {activeTab === 'profile' && onEditClick && (
                        <button onClick={onEditClick}
                            className="bg-white border-2 border-gray-100 text-gray-600 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 hover:border-gray-200 transition-all cursor-pointer shadow-sm flex-1 sm:flex-initial justify-center">
                            Edit Profile
                        </button>
                    )}
                    {activeTab === 'allocations' && (
                        <button onClick={() => router.push(`/dashboard/outsiders/allocations/add?outsiderId=${outsiderId}&category=${encodeURIComponent(outsider.category)}`)}
                            className="bg-[var(--primary)] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 hover:bg-[var(--primary-dark)] transition-all shadow-lg cursor-pointer flex-1 sm:flex-initial justify-center">
                            <Plus size={14} /> Add Allocation
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutsiderProfileHeader;

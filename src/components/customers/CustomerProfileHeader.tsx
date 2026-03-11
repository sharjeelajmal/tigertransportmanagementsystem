'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ProfileHeader from '@/components/staff/ProfileHeader';
import { ICustomer } from '@/models/Customer';

interface CustomerProfileHeaderProps {
    customer: ICustomer;
    activeTab: 'profile';
    customerId: string;
    onEditClick?: () => void;
}

const CustomerProfileHeader = ({ customer, activeTab, customerId, onEditClick }: CustomerProfileHeaderProps) => {
    const router = useRouter();
    return (
        <div className="space-y-4 md:space-y-8">
            <ProfileHeader
                firstName={customer.customerName}
                lastName=""
                designation="Customer"
                photo={undefined}
            />

            {/* Tabs + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 md:pb-4">
                <div className="flex gap-4 md:gap-6">
                    <button
                        onClick={() => router.push(`/dashboard/customers/${customerId}`)}
                        className={`text-xs md:text-sm font-bold transition-all relative pb-2 cursor-pointer ${activeTab === 'profile' ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Profile
                        {activeTab === 'profile' && (
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
                </div>
            </div>
        </div>
    );
};

export default CustomerProfileHeader;

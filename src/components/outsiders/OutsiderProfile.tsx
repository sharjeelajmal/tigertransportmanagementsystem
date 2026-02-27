'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoCard from '@/components/staff/InfoCard';
import EditModal from '@/components/staff/EditModal';
import Loader from '@/components/Loader';
import { IOutsider } from '@/models/Outsider';
import OutsiderProfileHeader from './OutsiderProfileHeader';

interface OutsiderProfileProps {
    outsiderId: string;
}

const OutsiderProfile = ({ outsiderId }: OutsiderProfileProps) => {
    const [outsider, setOutsider] = useState<IOutsider | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSection, setEditSection] = useState<string>('');
    const [editFields, setEditFields] = useState<any[]>([]);

    const fetchOutsider = async () => {
        try {
            const res = await fetch(`/api/outsiders/${outsiderId}`);
            if (res.ok) {
                const data = await res.json();
                setOutsider(data.data || data);
            } else {
                console.error('Failed to fetch outsider');
            }
        } catch (error) {
            console.error('Error fetching outsider:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutsider();
    }, [outsiderId]);

    const handleEdit = (section: string) => {
        setEditSection(section);
        let fields: any[] = [];

        if (section === 'Basic Information') {
            fields = [
                { name: 'outsiderName', label: 'Outsider Name', value: outsider?.outsiderName },
                { name: 'category', label: 'Category', type: 'select', options: ['Vehicle Outsider', 'Labor Outsider', 'Both'], value: outsider?.category },
                { name: 'contactNo', label: 'Contact No.', value: outsider?.contactNo },
            ];
        } else if (section === 'Contact Details') {
            fields = [
                { name: 'contactPersonName', label: 'Contact Person Name', value: outsider?.contactPersonName },
                { name: 'mobileNo', label: 'Mobile No.', value: outsider?.mobileNo },
                { name: 'emergencyContactNo', label: 'Emergency Contact No.', value: outsider?.emergencyContactNo },
                { name: 'address', label: 'Address', value: outsider?.address },
            ];
        }

        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleEditProfile = () => {
        setEditSection('Edit Profile');
        const fields = [
            { name: 'outsiderName', label: 'Outsider Name', value: outsider?.outsiderName },
            { name: 'category', label: 'Category', type: 'select', options: ['Vehicle Outsider', 'Labor Outsider', 'Both'], value: outsider?.category },
            { name: 'contactNo', label: 'Contact No.', value: outsider?.contactNo },
            { name: 'contactPersonName', label: 'Contact Person Name', value: outsider?.contactPersonName },
            { name: 'mobileNo', label: 'Mobile No.', value: outsider?.mobileNo },
            { name: 'emergencyContactNo', label: 'Emergency Contact No.', value: outsider?.emergencyContactNo },
            { name: 'address', label: 'Address', value: outsider?.address },
        ];
        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedData: any) => {
        try {
            const res = await fetch(`/api/outsiders/${outsiderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                await fetchOutsider(); // Refresh data
                setIsEditModalOpen(false);
            } else {
                console.error('Failed to update outsider');
            }
        } catch (error) {
            console.error('Error updating outsider:', error);
        }
    };

    if (loading) return <Loader fullScreen />;
    if (!outsider) return <div className="text-center text-red-500">Outsider not found.</div>;

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-8 max-w-7xl mx-auto relative">
            <OutsiderProfileHeader
                outsider={outsider}
                activeTab="profile"
                outsiderId={outsiderId}
                onEditClick={handleEditProfile}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8"
                >
                    {/* Basic Information */}
                    <InfoCard
                        title="Basic Information"
                        columns={2}
                        delay={0.1}
                        onEdit={() => handleEdit('Basic Information')}
                        items={[
                            { label: 'Outsider Name', value: outsider.outsiderName },
                            { label: 'Category', value: outsider.category },
                            { label: 'Contact No.', value: outsider.contactNo },
                        ]}
                    />

                    {/* Contact Details */}
                    <InfoCard
                        title="Contact Details"
                        columns={1}
                        delay={0.2}
                        onEdit={() => handleEdit('Contact Details')}
                        items={[
                            { label: 'Contact Person', value: outsider.contactPersonName || '-' },
                            { label: 'Mobile No.', value: outsider.mobileNo || '-' },
                            { label: 'Emergency Contact', value: outsider.emergencyContactNo || '-' },
                            { label: 'Address', value: outsider.address || '-' },
                        ]}
                    />
                </motion.div>
            </AnimatePresence>

            <EditModal
                isOpen={isEditModalOpen}
                title={editSection}
                fields={editFields}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default OutsiderProfile;


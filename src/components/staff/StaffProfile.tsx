'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from './ProfileHeader';
import InfoCard from './InfoCard';
import EditModal from './EditModal';
import Loader from '@/components/Loader';
import { IStaff } from '@/models/Staff';
import { useRouter } from 'next/navigation';

interface StaffProfileProps {
    staffId: string;
}

const StaffProfile = ({ staffId }: StaffProfileProps) => {
    const router = useRouter();
    const [staff, setStaff] = useState<IStaff | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSection, setEditSection] = useState<string>('');
    const [editFields, setEditFields] = useState<any[]>([]);

    const fetchStaff = async () => {
        try {
            const res = await fetch(`/api/staff/${staffId}`);
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            } else {
                console.error('Failed to fetch staff');
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [staffId]);

    const handleEdit = (section: string) => {
        setEditSection(section);
        let fields: any[] = [];

        if (section === 'Personal Information') {
            fields = [
                { name: 'firstName', label: 'First Name', value: staff?.firstName },
                { name: 'lastName', label: 'Last Name', value: staff?.lastName },
                { name: 'cnic', label: 'CNIC No.', value: staff?.cnic },
                { name: 'guarantorName', label: 'Guarantor Name', value: staff?.guarantorName },
                { name: 'guarantorContact', label: 'Guarantor Contact', value: staff?.guarantorContact },
            ];
        } else if (section === 'Contact Information') {
            fields = [
                { name: 'mobile', label: 'Mobile No.', value: staff?.mobile },
                { name: 'emergencyContact', label: 'Emergency Contact No.', value: staff?.emergencyContact },
                { name: 'address', label: 'Current Address', value: staff?.address },
            ];
        } else if (section === 'Employment Details') {
            fields = [
                { name: 'designation', label: 'Designation', type: 'select', options: ['Operation Manager', 'Transport Manager', 'Warehouse Supervisor', 'Labor', 'Driver', 'Admin'], value: staff?.designation },
                { name: 'status', label: 'Status', type: 'select', options: ['On Duty', 'Off Duty'], value: staff?.status },
            ];
        } else if (section === 'Payroll Structure') {
            fields = [
                { name: 'basicSalary', label: 'Basic Salary', type: 'number', value: staff?.basicSalary },
            ];
        }

        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedData: any) => {
        try {
            const res = await fetch(`/api/staff/${staffId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                await fetchStaff(); // Refresh data
                setIsEditModalOpen(false);
            } else {
                console.error('Failed to update staff');
            }
        } catch (error) {
            console.error('Error updating staff:', error);
        }
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    if (!staff) {
        return <div className="text-center text-red-500">Staff member not found.</div>;
    }

    const formatDate = (dateString?: Date) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto relative">

            <ProfileHeader
                firstName={staff.firstName}
                lastName={staff.lastName}
                designation={staff.designation}
                photo={staff.photo}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <InfoCard
                    title="Personal Information"
                    columns={2}
                    delay={0.1}
                    onEdit={() => handleEdit('Personal Information')}
                    items={[
                        { label: 'First Name', value: staff.firstName },
                        { label: 'Last Name', value: staff.lastName },
                        { label: 'CNIC No.', value: staff.cnic },
                        { label: 'Guarantor Name', value: staff.guarantorName || '-' },
                        { label: 'Guarantor Contact', value: staff.guarantorContact || '-' },
                    ]}
                />

                {/* Contact Information */}
                <InfoCard
                    title="Contact Information"
                    columns={1}
                    delay={0.2}
                    onEdit={() => handleEdit('Contact Information')}
                    items={[
                        { label: 'Mobile No.', value: staff.mobile },
                        { label: 'Emergency Contact No.', value: staff.emergencyContact },
                        { label: 'Current Address', value: staff.address },
                    ]}
                />
            </div>

            {/* Employment Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full"
            >
                <InfoCard
                    title="Employment Details"
                    columns={2}
                    delay={0.3}
                    onEdit={() => handleEdit('Employment Details')}
                    items={[
                        { label: 'Designation', value: staff.designation },
                        { label: 'Status', value: staff.status },
                    ]}
                />
            </motion.div>

            {/* Payroll Structure */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-full"
            >
                <InfoCard
                    title="Payroll Structure"
                    columns={1}
                    delay={0.4}
                    onEdit={() => handleEdit('Payroll Structure')}
                    items={[
                        { label: 'Basic Salary', value: `${staff.basicSalary} PKR` },
                    ]}
                />
            </motion.div>

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

export default StaffProfile;

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoCard from '@/components/staff/InfoCard';
import EditModal from '@/components/staff/EditModal';
import Loader from '@/components/Loader';
import { ICustomer } from '@/models/Customer';
import CustomerProfileHeader from './CustomerProfileHeader';

interface CustomerProfileProps {
    customerId: string;
}

const CustomerProfile = ({ customerId }: CustomerProfileProps) => {
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSection, setEditSection] = useState<string>('');
    const [editFields, setEditFields] = useState<any[]>([]);

    const fetchCustomer = async () => {
        try {
            const res = await fetch(`/api/customers/${customerId}`);
            if (res.ok) {
                const data = await res.json();
                setCustomer(data.data || data);
            } else {
                console.error('Failed to fetch customer');
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const handleEdit = (section: string) => {
        setEditSection(section);
        let fields: any[] = [];

        if (section === 'Basic Information') {
            fields = [
                { name: 'customerName', label: 'Customer Name', value: customer?.customerName },
                { name: 'mobileNo', label: 'Mobile No.', value: customer?.mobileNo },
                { name: 'emergencyNo', label: 'Emergency No.', value: customer?.emergencyNo },
            ];
        } else if (section === 'Contact Details') {
            fields = [
                { name: 'email', label: 'Email', value: customer?.email },
                { name: 'address', label: 'Address', value: customer?.address },
            ];
        } else if (section === 'Additional Details') {
            fields = [
                { name: 'refPerson', label: 'Reference Person', value: customer?.refPerson },
                { name: 'remarks', label: 'Remarks', value: customer?.remarks },
            ];
        }

        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleEditProfile = () => {
        setEditSection('Edit Profile');
        const fields = [
            { name: 'customerName', label: 'Customer Name', value: customer?.customerName },
            { name: 'mobileNo', label: 'Mobile No.', value: customer?.mobileNo },
            { name: 'emergencyNo', label: 'Emergency No.', value: customer?.emergencyNo },
            { name: 'email', label: 'Email', value: customer?.email },
            { name: 'address', label: 'Address', value: customer?.address },
            { name: 'refPerson', label: 'Reference Person', value: customer?.refPerson },
            { name: 'remarks', label: 'Remarks', value: customer?.remarks },
        ];
        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedData: any) => {
        try {
            const res = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                await fetchCustomer(); // Refresh data
                setIsEditModalOpen(false);
            } else {
                console.error('Failed to update customer');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
        }
    };

    if (loading) return <Loader fullScreen />;
    if (!customer) return <div className="text-center text-red-500 mt-10">Customer not found.</div>;

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-8 max-w-7xl mx-auto relative">
            <CustomerProfileHeader
                customer={customer}
                activeTab="profile"
                customerId={customerId}
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
                        columns={1}
                        delay={0.1}
                        onEdit={() => handleEdit('Basic Information')}
                        items={[
                            { label: 'Customer Name', value: customer.customerName },
                            { label: 'Mobile No.', value: customer.mobileNo || '-' },
                            { label: 'Emergency No.', value: customer.emergencyNo || '-' },
                        ]}
                    />

                    {/* Contact Details */}
                    <InfoCard
                        title="Contact Details"
                        columns={1}
                        delay={0.2}
                        onEdit={() => handleEdit('Contact Details')}
                        items={[
                            { label: 'Email', value: customer.email || '-' },
                            { label: 'Address', value: customer.address || '-' },
                        ]}
                    />

                    {/* Additional Details */}
                    <InfoCard
                        title="Additional Details"
                        columns={1}
                        delay={0.3}
                        onEdit={() => handleEdit('Additional Details')}
                        items={[
                            { label: 'Reference Person', value: customer.refPerson || '-' },
                            { label: 'Remarks', value: customer.remarks || '-' },
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

export default CustomerProfile;

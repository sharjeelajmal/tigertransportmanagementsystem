"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Truck } from "lucide-react";
import Loader from "@/components/Loader";
import InfoCard from "@/components/staff/InfoCard";
import EditModal from "@/components/staff/EditModal";

interface Vehicle {
    _id: string;
    vehicleName: string;
    plateNumber: string;
    engineNumber: string;
    chassisNumber: string;
    modelYear: number;
    status: string;
    ownerName: string;
    routePermitExpiry: string;
    tokenTaxExpiry: string;
    insuranceExpiry: string;
    fitnessExpiry: string;
    trackerExpiry: string;
}

export default function VehicleProfilePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSection, setEditSection] = useState("");
    const [editFields, setEditFields] = useState<any[]>([]);

    const fetchVehicle = async () => {
        try {
            const res = await fetch(`/api/vehicles/${id}`);
            const data = await res.json();
            if (data.success) {
                setVehicle(data.data);
            } else {
                router.push("/dashboard/vehicles");
            }
        } catch (error) {
            console.error("Failed to fetch vehicle:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchVehicle();
    }, [id]);

    const fmt = (d: string | undefined) =>
        d ? new Date(d).toLocaleDateString("en-GB") : "N/A";

    const handleEdit = (section: string) => {
        setEditSection(section);
        let fields: any[] = [];

        if (section === "Basic Vehicle Information") {
            fields = [
                { name: "vehicleName", label: "Vehicle Name", value: vehicle?.vehicleName },
                { name: "plateNumber", label: "Plate Number", value: vehicle?.plateNumber },
                { name: "engineNumber", label: "Engine Number", value: vehicle?.engineNumber },
                { name: "chassisNumber", label: "Chassis Number", value: vehicle?.chassisNumber },
                { name: "modelYear", label: "Model Year", type: "number", value: vehicle?.modelYear },
            ];
        } else if (section === "Ownership & Assignment") {
            fields = [
                { name: "ownerName", label: "Owner Name", value: vehicle?.ownerName },
                { name: "status", label: "Status", type: "select", options: ["Available", "On Route", "Under Maintenance", "Out of Service"], value: vehicle?.status },
            ];
        } else if (section === "Legal & Document Details") {
            fields = [
                { name: "routePermitExpiry", label: "Route Permit Expiry", type: "date", value: vehicle?.routePermitExpiry },
                { name: "tokenTaxExpiry", label: "Token Tax Expiry", type: "date", value: vehicle?.tokenTaxExpiry },
                { name: "insuranceExpiry", label: "Insurance Expiry", type: "date", value: vehicle?.insuranceExpiry },
                { name: "fitnessExpiry", label: "Fitness Expiry", type: "date", value: vehicle?.fitnessExpiry },
                { name: "trackerExpiry", label: "Tracker Expiry", type: "date", value: vehicle?.trackerExpiry },
            ];
        }

        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedData: any) => {
        try {
            const res = await fetch(`/api/vehicles/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                await fetchVehicle();
                setIsEditModalOpen(false);
            } else {
                console.error("Failed to update vehicle");
            }
        } catch (error) {
            console.error("Error updating vehicle:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!vehicle) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-48 rounded-3xl overflow-hidden flex flex-col justify-end p-8"
                style={{ background: "linear-gradient(135deg, #B50104, #8B0003)" }}
            >
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                        {vehicle.vehicleName}
                    </h1>
                    <p className="text-white/80 font-mono text-lg mt-1">
                        {vehicle.plateNumber}
                    </p>
                </div>

                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            </motion.div>

            {/* Basic Info */}
            <InfoCard
                title="Basic Vehicle Information"
                columns={2}
                delay={0.1}
                onEdit={() => handleEdit("Basic Vehicle Information")}
                items={[
                    { label: "Vehicle Name", value: vehicle.vehicleName },
                    { label: "Plate Number", value: vehicle.plateNumber },
                    { label: "Engine No.", value: vehicle.engineNumber || "-" },
                    { label: "Chassis No.", value: vehicle.chassisNumber || "-" },
                    { label: "Model Year", value: vehicle.modelYear },
                ]}
            />

            {/* Ownership */}
            <InfoCard
                title="Ownership & Assignment"
                columns={2}
                delay={0.2}
                onEdit={() => handleEdit("Ownership & Assignment")}
                items={[
                    { label: "Owner Name", value: vehicle.ownerName || "-" },
                    { label: "Status", value: vehicle.status },
                ]}
            />

            {/* Documents */}
            <InfoCard
                title="Legal & Document Details"
                columns={2}
                delay={0.3}
                onEdit={() => handleEdit("Legal & Document Details")}
                items={[
                    { label: "Route Permit Expiry", value: fmt(vehicle.routePermitExpiry) },
                    { label: "Token Tax Expiry", value: fmt(vehicle.tokenTaxExpiry) },
                    { label: "Insurance Expiry", value: fmt(vehicle.insuranceExpiry) },
                    { label: "Fitness Expiry", value: fmt(vehicle.fitnessExpiry) },
                    { label: "Tracker Expiry", value: fmt(vehicle.trackerExpiry) },
                ]}
            />

            {/* Edit Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                title={editSection}
                fields={editFields}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import InfoCard from "@/components/staff/InfoCard";
import EditModal from "@/components/staff/EditModal";
import ProfileHeader from "@/components/staff/ProfileHeader";

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
            if (data.success) setVehicle(data.data);
            else router.push("/dashboard/vehicles");
        } catch { console.error("Failed to fetch vehicle"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (id) fetchVehicle(); }, [id]);

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
        const res = await fetch(`/api/vehicles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });
        if (res.ok) { await fetchVehicle(); setIsEditModalOpen(false); }
    };

    if (isLoading) return <Loader fullScreen />;
    if (!vehicle) return null;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto relative">
            {/* Same ProfileHeader as Staff — vehicle name as firstName, plate as designation */}
            <ProfileHeader
                firstName={vehicle.vehicleName}
                lastName=""
                designation={vehicle.plateNumber}
                photo={undefined}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                <InfoCard
                    title="Ownership & Assignment"
                    columns={1}
                    delay={0.2}
                    onEdit={() => handleEdit("Ownership & Assignment")}
                    items={[
                        { label: "Owner Name", value: vehicle.ownerName || "-" },
                        { label: "Status", value: vehicle.status },
                    ]}
                />
            </div>

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

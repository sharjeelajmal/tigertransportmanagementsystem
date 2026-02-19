import StaffProfile from '@/components/staff/StaffProfile';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StaffProfilePage({ params }: PageProps) {
    const { id } = await params;
    return <StaffProfile staffId={id} />;
}

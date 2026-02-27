import OutsiderProfile from '@/components/outsiders/OutsiderProfile';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function OutsiderProfilePage({ params }: PageProps) {
    const { id } = await params;
    return <OutsiderProfile outsiderId={id} />;
}

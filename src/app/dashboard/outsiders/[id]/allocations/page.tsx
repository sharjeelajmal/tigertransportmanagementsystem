import OutsiderAllocationsClient from './OutsiderAllocationsClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function OutsiderAllocationsPage({ params }: PageProps) {
    const { id } = await params;
    return <OutsiderAllocationsClient outsiderId={id} />;
}

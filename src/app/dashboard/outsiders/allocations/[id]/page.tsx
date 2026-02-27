import AllocationDetailClient from './AllocationDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AllocationDetailViewPage({ params }: PageProps) {
    const { id } = await params;
    return <AllocationDetailClient id={id} />;
}

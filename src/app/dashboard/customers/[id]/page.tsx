import CustomerProfile from '@/components/customers/CustomerProfile';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CustomerProfilePage({ params }: PageProps) {
    const { id } = await params;
    return <CustomerProfile customerId={id} />;
}

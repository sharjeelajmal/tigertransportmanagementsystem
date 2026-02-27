import { Suspense } from 'react';
import AddAllocationClient from './AddAllocationClient';
import Loader from '@/components/Loader';

export default function AddAllocationPage() {
    return (
        <Suspense fallback={<Loader fullScreen />}>
            <AddAllocationClient />
        </Suspense>
    );
}

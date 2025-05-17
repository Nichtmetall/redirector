import { CustomerDetailClient } from './client';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
    return <CustomerDetailClient id={params.id} />;
} 
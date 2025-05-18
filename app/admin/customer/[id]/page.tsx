import { CustomerDetailClient } from './client';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
    const id = await Promise.resolve(params.id);
    return <CustomerDetailClient id={id} />;
} 
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductForm } from '@/components/product-form';
import { apiFetch, type Product } from '@/lib/api-client';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Product>(`/catalog/products/${params.id}`)
      .then(setProduct)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Товар не найден'),
      );
  }, [params.id]);

  if (error) {
    return <p className="text-sm text-[var(--destructive)]">{error}</p>;
  }

  if (!product) {
    return <p className="text-sm text-[var(--muted-foreground)]">Загрузка...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}

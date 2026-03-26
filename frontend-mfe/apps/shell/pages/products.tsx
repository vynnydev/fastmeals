import dynamic from 'next/dynamic';

const ProductsPage = dynamic(() => import('products/ProductsPage'), { ssr: false });

export default function Products() {
  return <ProductsPage />;
}

export const getServerSideProps = async () => {
  return { props: {} };
};
import ProductsPage from '../components/ProductsPage';

export default function ProductsStandalone() {
  return (
    <div className="p-6">
      <ProductsPage />
    </div>
  );
}

export const getServerSideProps = async () => {
  return { props: {} };
};
import OrdersPage from '../components/OrdersPage';

export default function OrdersStandalone() {
  return (
    <div className="p-6">
      <OrdersPage />
    </div>
  );
}

export const getServerSideProps = async () => {
  return { props: {} };
};
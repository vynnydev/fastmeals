import dynamic from 'next/dynamic';

const OrdersPage = dynamic(() => import('orders/OrdersPage'), { ssr: false });

export default function Orders() {
  return <OrdersPage />;
}

export const getServerSideProps = async () => {
  return { props: {} };
};
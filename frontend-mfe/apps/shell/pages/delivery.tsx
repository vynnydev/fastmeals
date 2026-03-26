import dynamic from 'next/dynamic';

const DeliveryPage = dynamic(() => import('delivery/DeliveryPage'), { ssr: false });

export default function Delivery() {
  return <DeliveryPage />;
}

export const getServerSideProps = async () => {
  return { props: {} };
};
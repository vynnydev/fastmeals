import DeliveryPage from '../components/DeliveryPage';

export default function DeliveryStandalone() {
  return (
    <div className="p-6">
      <DeliveryPage />
    </div>
  );
}

export const getServerSideProps = async () => {
  return { props: {} };
};
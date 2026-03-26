import ReportsPage from '../components/ReportsPage';

export default function ReportsStandalone() {
  return (
    <div className="p-6">
      <ReportsPage />
    </div>
  );
}

export const getServerSideProps = async () => {
  return { props: {} };
};
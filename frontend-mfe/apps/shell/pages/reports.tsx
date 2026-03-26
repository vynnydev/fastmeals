import dynamic from 'next/dynamic';

const ReportsPage = dynamic(() => import('reports/ReportsPage'), { ssr: false });

export default function Reports() {
  return <ReportsPage />;
}

export const getServerSideProps = async () => {
  return { props: {} };
};
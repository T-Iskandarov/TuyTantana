import DashboardClientLayout from './DashboardClientLayout';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}

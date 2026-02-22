import { EmployeeProvider } from "./employee-context";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeProvider>{children}</EmployeeProvider>;
}

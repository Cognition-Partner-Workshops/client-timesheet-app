"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  department: string;
  jobTitle: string;
  employeeId: string;
  startDate: string;
}

interface EmployeeContextType {
  employees: EmployeeFormData[];
  addEmployee: (employee: EmployeeFormData) => void;
  searchEmployees: (query: string) => EmployeeFormData[];
  deleteEmployee: (employeeId: string) => boolean;
}

const sampleEmployees: EmployeeFormData[] = [
  {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice.johnson@example.com",
    phone: "555-0101",
    dateOfBirth: "1990-03-15",
    gender: "female",
    addressLine1: "123 Maple Street",
    addressLine2: "Apt 4B",
    city: "Austin",
    state: "TX",
    zipCode: "73301",
    country: "USA",
    department: "Engineering",
    jobTitle: "Software Engineer",
    employeeId: "EMP001",
    startDate: "2022-01-10",
  },
  {
    firstName: "Bob",
    lastName: "Smith",
    email: "bob.smith@example.com",
    phone: "555-0102",
    dateOfBirth: "1985-07-22",
    gender: "male",
    addressLine1: "456 Oak Avenue",
    addressLine2: "",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    country: "USA",
    department: "Marketing",
    jobTitle: "Marketing Manager",
    employeeId: "EMP002",
    startDate: "2021-06-01",
  },
  {
    firstName: "Carol",
    lastName: "Williams",
    email: "carol.williams@example.com",
    phone: "555-0103",
    dateOfBirth: "1992-11-08",
    gender: "female",
    addressLine1: "789 Pine Road",
    addressLine2: "Suite 200",
    city: "Denver",
    state: "CO",
    zipCode: "80201",
    country: "USA",
    department: "Human Resources",
    jobTitle: "HR Specialist",
    employeeId: "EMP003",
    startDate: "2023-03-20",
  },
  {
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
    phone: "555-0104",
    dateOfBirth: "1988-01-30",
    gender: "male",
    addressLine1: "321 Elm Boulevard",
    addressLine2: "",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    country: "USA",
    department: "Finance",
    jobTitle: "Financial Analyst",
    employeeId: "EMP004",
    startDate: "2020-09-15",
  },
  {
    firstName: "Eva",
    lastName: "Martinez",
    email: "eva.martinez@example.com",
    phone: "555-0105",
    dateOfBirth: "1995-05-12",
    gender: "female",
    addressLine1: "654 Birch Lane",
    addressLine2: "Floor 3",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "USA",
    department: "Engineering",
    jobTitle: "Frontend Developer",
    employeeId: "EMP005",
    startDate: "2024-01-08",
  },
];

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<EmployeeFormData[]>(sampleEmployees);

  const addEmployee = useCallback((employee: EmployeeFormData) => {
    setEmployees((prev) => [...prev, employee]);
  }, []);

  const searchEmployees = useCallback(
    (query: string): EmployeeFormData[] => {
      if (!query.trim()) return employees;
      const lower = query.toLowerCase().trim();
      return employees.filter(
        (emp) =>
          emp.employeeId.toLowerCase().includes(lower) ||
          emp.firstName.toLowerCase().includes(lower) ||
          emp.lastName.toLowerCase().includes(lower) ||
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lower)
      );
    },
    [employees]
  );

  const deleteEmployee = useCallback(
    (employeeId: string): boolean => {
      const index = employees.findIndex(
        (emp) => emp.employeeId.toLowerCase() === employeeId.toLowerCase()
      );
      if (index === -1) return false;
      setEmployees((prev) => prev.filter((emp) => emp.employeeId.toLowerCase() !== employeeId.toLowerCase()));
      return true;
    },
    [employees]
  );

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, searchEmployees, deleteEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
}

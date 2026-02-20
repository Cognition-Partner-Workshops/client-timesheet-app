"use client";

import { useState } from "react";
import Link from "next/link";
import { useEmployees, EmployeeFormData } from "./employee-context";

const initialFormData: EmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  department: "",
  jobTitle: "",
  employeeId: "",
  startDate: "",
};

export default function EmployeePage() {
  const { addEmployee } = useEmployees();
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addEmployee(formData);
    setSubmitted(true);
  }

  function handleReset() {
    setFormData(initialFormData);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-8 sm:p-20 font-sans">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-8 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Employee Details Saved</h2>
            <p className="text-foreground/60 mb-6">
              Personal details for {formData.firstName} {formData.lastName} have
              been recorded successfully.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleReset}
                className="rounded-full bg-foreground text-background px-6 py-2 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
              >
                Add Another Employee
              </button>
              <Link
                href="/employee/search"
                className="rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-2 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                Search Employees
              </Link>
              <Link
                href="/"
                className="rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-2 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 sm:p-20 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Employee Details</h1>
          <div className="flex gap-2">
            <Link
              href="/employee/search"
              className="rounded-full border border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              Search
            </Link>
            <Link
              href="/"
              className="rounded-full border border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              Home
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-black/[.08] dark:border-white/[.145]">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-black/[.08] dark:border-white/[.145]">
              Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">
                  Address Line 2
                </label>
                <input
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-1">
                  State / Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                  ZIP / Postal Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-black/[.08] dark:border-white/[.145]">
              Employment Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium mb-1">
                  Employee ID
                </label>
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-1">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium mb-1">
                  Job Title
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-black/[.08] dark:border-white/[.145] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>
          </section>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="rounded-full bg-foreground text-background px-8 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
            >
              Save Employee
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-black/[.08] dark:border-white/[.145] px-8 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useEmployees, EmployeeFormData } from "../employee-context";

export default function DeletePage() {
  const { searchEmployees, deleteEmployee } = useEmployees();
  const [employeeId, setEmployeeId] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<EmployeeFormData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deletedName, setDeletedName] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setDeleteSuccess(false);
    const results = searchEmployees(employeeId.trim());
    const exact = results.find(
      (emp) => emp.employeeId.toLowerCase() === employeeId.trim().toLowerCase()
    );
    setFoundEmployee(exact || null);
    setHasSearched(true);
  }

  function handleDelete() {
    if (!foundEmployee) return;
    const name = `${foundEmployee.firstName} ${foundEmployee.lastName}`;
    const id = foundEmployee.employeeId;
    const success = deleteEmployee(id);
    if (success) {
      setDeletedName(`${name} (${id})`);
      setDeleteSuccess(true);
      setFoundEmployee(null);
      setHasSearched(false);
      setEmployeeId("");
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmployeeId(e.target.value);
    if (!e.target.value.trim()) {
      setHasSearched(false);
      setFoundEmployee(null);
      setDeleteSuccess(false);
    }
  }

  if (deleteSuccess) {
    return (
      <div className="min-h-screen bg-background p-8 sm:p-20 font-sans">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-12">
            <svg
              className="mx-auto mb-6 h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Employee Deleted</h2>
            <p className="text-foreground/60 mb-8">
              {deletedName} has been successfully removed.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setDeleteSuccess(false);
                  setDeletedName("");
                }}
                className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
              >
                Delete Another
              </button>
              <Link
                href="/employee/search"
                className="rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                Search Employees
              </Link>
              <Link
                href="/"
                className="rounded-full border border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 sm:p-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Delete Employee</h1>
          <div className="flex gap-2">
            <Link
              href="/employee"
              className="rounded-full border border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              Add Employee
            </Link>
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

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                />
              </svg>
              <input
                type="text"
                value={employeeId}
                onChange={handleInputChange}
                placeholder="Enter Employee ID (e.g., EMP001)..."
                className="w-full rounded-full border border-black/[.08] dark:border-white/[.145] bg-transparent pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-foreground text-background px-8 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
            >
              Find
            </button>
          </div>
        </form>

        {hasSearched && foundEmployee && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {foundEmployee.firstName} {foundEmployee.lastName}
                </h3>
                <p className="text-sm text-foreground/60 mt-1">
                  {foundEmployee.jobTitle}
                  {foundEmployee.department ? ` - ${foundEmployee.department}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-mono font-medium">
                {foundEmployee.employeeId}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6">
              <div>
                <span className="text-foreground/50">Email:</span>{" "}
                {foundEmployee.email}
              </div>
              <div>
                <span className="text-foreground/50">Phone:</span>{" "}
                {foundEmployee.phone}
              </div>
              <div>
                <span className="text-foreground/50">Location:</span>{" "}
                {foundEmployee.city}
                {foundEmployee.state ? `, ${foundEmployee.state}` : ""}
                {foundEmployee.country ? `, ${foundEmployee.country}` : ""}
              </div>
            </div>
            <div className="border-t border-black/[.08] dark:border-white/[.145] pt-4">
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                Are you sure you want to delete this employee? This action cannot be undone.
              </p>
              <button
                onClick={handleDelete}
                className="rounded-full bg-red-600 text-white px-8 py-3 font-medium hover:bg-red-700 transition-colors"
              >
                Delete Employee
              </button>
            </div>
          </div>
        )}

        {hasSearched && !foundEmployee && (
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-8 text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-foreground/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-foreground/60">
              No employee found with ID &quot;{employeeId.trim()}&quot;.
            </p>
          </div>
        )}

        {!hasSearched && (
          <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-8 text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-foreground/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <p className="text-foreground/60">
              Enter an Employee ID to find and delete an employee.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

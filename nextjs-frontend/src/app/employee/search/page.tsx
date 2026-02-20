"use client";

import { useState } from "react";
import Link from "next/link";
import { useEmployees, EmployeeFormData } from "../employee-context";

export default function SearchPage() {
  const { searchEmployees } = useEmployees();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EmployeeFormData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setResults(searchEmployees(query));
    setHasSearched(true);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      setHasSearched(false);
      setResults([]);
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 sm:p-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Search Employees</h1>
          <div className="flex gap-2">
            <Link
              href="/employee"
              className="rounded-full border border-black/[.08] dark:border-white/[.145] px-4 py-2 text-sm font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
            >
              Add Employee
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search by Employee ID or Name..."
                className="w-full rounded-full border border-black/[.08] dark:border-white/[.145] bg-transparent pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-foreground text-background px-8 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {hasSearched && (
          <div>
            <p className="text-sm text-foreground/60 mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} found
              {query.trim() ? ` for "${query.trim()}"` : ""}
            </p>

            {results.length === 0 ? (
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
                  No employees found matching your search.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((emp, index) => (
                  <div
                    key={`${emp.employeeId}-${index}`}
                    className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-6 hover:bg-[#f2f2f2]/50 dark:hover:bg-[#1a1a1a]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {emp.firstName} {emp.lastName}
                        </h3>
                        <p className="text-sm text-foreground/60 mt-1">
                          {emp.jobTitle}
                          {emp.department ? ` - ${emp.department}` : ""}
                        </p>
                      </div>
                      {emp.employeeId && (
                        <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-mono font-medium">
                          {emp.employeeId}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-foreground/50">Email:</span>{" "}
                        {emp.email}
                      </div>
                      <div>
                        <span className="text-foreground/50">Phone:</span>{" "}
                        {emp.phone}
                      </div>
                      <div>
                        <span className="text-foreground/50">Location:</span>{" "}
                        {emp.city}
                        {emp.state ? `, ${emp.state}` : ""}
                        {emp.country ? `, ${emp.country}` : ""}
                      </div>
                    </div>
                    {emp.startDate && (
                      <p className="text-xs text-foreground/40 mt-3">
                        Start date: {emp.startDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-foreground/60">
              Enter an Employee ID or Name to search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

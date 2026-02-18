import { v4 as uuidv4 } from "uuid";
import { Customer, CreateCustomerInput, UpdateCustomerInput } from "./types";
import logger from "./logger";

const customers: Map<string, Customer> = new Map();

export function createCustomer(input: CreateCustomerInput): Customer {
  const now = new Date().toISOString();
  const uniqueId = uuidv4();

  const customer: Customer = {
    uniqueId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    dob: input.dob,
    birthDate: input.birthDate,
    gender: input.gender,
    phoneNo: input.phoneNo,
    street: input.street,
    town: input.town,
    city: input.city,
    district: input.district,
    postalCode: input.postalCode,
    createdOn: now,
    updatedOn: now,
  };

  customers.set(uniqueId, customer);
  logger.info({ uniqueId }, "Customer created in mock DB");
  return customer;
}

export function getCustomerById(uniqueId: string): Customer | undefined {
  const customer = customers.get(uniqueId);
  if (customer) {
    logger.info({ uniqueId }, "Customer found by ID");
  } else {
    logger.warn({ uniqueId }, "Customer not found by ID");
  }
  return customer;
}

export function getCustomerByEmail(email: string): Customer | undefined {
  const customer = Array.from(customers.values()).find(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  if (customer) {
    logger.info({ email }, "Customer found by email");
  } else {
    logger.warn({ email }, "Customer not found by email");
  }
  return customer;
}

export function getCustomerByPhoneNo(phoneNo: string): Customer | undefined {
  const customer = Array.from(customers.values()).find(
    (c) => c.phoneNo === phoneNo
  );
  if (customer) {
    logger.info({ phoneNo }, "Customer found by phone number");
  } else {
    logger.warn({ phoneNo }, "Customer not found by phone number");
  }
  return customer;
}

export function updateCustomer(
  uniqueId: string,
  input: UpdateCustomerInput
): Customer | undefined {
  const existing = customers.get(uniqueId);
  if (!existing) {
    logger.warn({ uniqueId }, "Cannot update: customer not found");
    return undefined;
  }

  const updated: Customer = {
    ...existing,
    firstName: input.firstName ?? existing.firstName,
    lastName: input.lastName ?? existing.lastName,
    email: input.email ?? existing.email,
    dob: input.dob ?? existing.dob,
    birthDate: input.birthDate ?? existing.birthDate,
    gender: input.gender ?? existing.gender,
    phoneNo: input.phoneNo ?? existing.phoneNo,
    street: input.street ?? existing.street,
    town: input.town ?? existing.town,
    city: input.city ?? existing.city,
    district: input.district ?? existing.district,
    postalCode: input.postalCode ?? existing.postalCode,
    updatedOn: new Date().toISOString(),
  };

  customers.set(uniqueId, updated);
  logger.info({ uniqueId }, "Customer updated in mock DB");
  return updated;
}

export function deleteCustomer(uniqueId: string): boolean {
  const existed = customers.has(uniqueId);
  if (existed) {
    customers.delete(uniqueId);
    logger.info({ uniqueId }, "Customer deleted from mock DB");
  } else {
    logger.warn({ uniqueId }, "Cannot delete: customer not found");
  }
  return existed;
}

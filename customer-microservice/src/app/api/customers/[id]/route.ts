import { NextRequest, NextResponse } from "next/server";
import { getCustomerById, updateCustomer, deleteCustomer } from "@/lib/db";
import { UpdateCustomerInput } from "@/lib/types";
import { instrumentRoute } from "@/lib/instrumentation";
import logger from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return instrumentRoute("GET", `/api/customers/${id}`, async () => {
    const customer = getCustomerById(id);

    if (!customer) {
      logger.warn({ uniqueId: id }, "Customer not found");
      return {
        response: NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        ),
        statusCode: 404,
      };
    }

    return {
      response: NextResponse.json(customer),
      statusCode: 200,
    };
  }).then((result) => result.response);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return instrumentRoute("PUT", `/api/customers/${id}`, async () => {
    const body: UpdateCustomerInput = await request.json();
    const customer = updateCustomer(id, body);

    if (!customer) {
      logger.warn({ uniqueId: id }, "Customer not found for update");
      return {
        response: NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        ),
        statusCode: 404,
      };
    }

    logger.info({ uniqueId: id }, "Customer updated successfully");
    return {
      response: NextResponse.json(customer),
      statusCode: 200,
    };
  }).then((result) => result.response);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return instrumentRoute("DELETE", `/api/customers/${id}`, async () => {
    const deleted = deleteCustomer(id);

    if (!deleted) {
      logger.warn({ uniqueId: id }, "Customer not found for deletion");
      return {
        response: NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        ),
        statusCode: 404,
      };
    }

    logger.info({ uniqueId: id }, "Customer deleted successfully");
    return {
      response: NextResponse.json({ message: "Customer deleted successfully" }),
      statusCode: 200,
    };
  }).then((result) => result.response);
}

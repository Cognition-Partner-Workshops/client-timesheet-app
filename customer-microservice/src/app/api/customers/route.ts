import { NextRequest, NextResponse } from "next/server";
import { createCustomer } from "@/lib/db";
import { CreateCustomerInput } from "@/lib/types";
import { instrumentRoute } from "@/lib/instrumentation";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  return instrumentRoute("POST", "/api/customers", async () => {
    const body: CreateCustomerInput = await request.json();

    const requiredFields: (keyof CreateCustomerInput)[] = [
      "firstName",
      "lastName",
      "email",
      "dob",
      "birthDate",
      "gender",
      "phoneNo",
      "street",
      "town",
      "city",
      "district",
      "postalCode",
    ];

    const missingFields = requiredFields.filter(
      (field) => !body[field] || String(body[field]).trim() === ""
    );

    if (missingFields.length > 0) {
      logger.warn({ missingFields }, "Validation failed: missing required fields");
      return {
        response: NextResponse.json(
          { error: "Missing required fields", missingFields },
          { status: 400 }
        ),
        statusCode: 400,
      };
    }

    const customer = createCustomer(body);
    logger.info({ uniqueId: customer.uniqueId }, "Customer created successfully");

    return {
      response: NextResponse.json(customer, { status: 201 }),
      statusCode: 201,
    };
  }).then((result) => result.response);
}

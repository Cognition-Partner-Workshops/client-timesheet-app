import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail } from "@/lib/db";
import { instrumentRoute } from "@/lib/instrumentation";
import logger from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);

  return instrumentRoute(
    "GET",
    `/api/customers/email/${decodedEmail}`,
    async () => {
      const customer = getCustomerByEmail(decodedEmail);

      if (!customer) {
        logger.warn({ email: decodedEmail }, "Customer not found by email");
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
    }
  ).then((result) => result.response);
}

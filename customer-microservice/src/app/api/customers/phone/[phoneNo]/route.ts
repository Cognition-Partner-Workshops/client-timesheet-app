import { NextRequest, NextResponse } from "next/server";
import { getCustomerByPhoneNo } from "@/lib/db";
import { instrumentRoute } from "@/lib/instrumentation";
import logger from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ phoneNo: string }> }
) {
  const { phoneNo } = await params;
  const decodedPhoneNo = decodeURIComponent(phoneNo);

  return instrumentRoute(
    "GET",
    `/api/customers/phone/${decodedPhoneNo}`,
    async () => {
      const customer = getCustomerByPhoneNo(decodedPhoneNo);

      if (!customer) {
        logger.warn(
          { phoneNo: decodedPhoneNo },
          "Customer not found by phone number"
        );
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

import { NextResponse } from "next/server";

const ALLOWED_PROPERTY_TYPES = new Set([
  "Single Family",
  "Condo",
  "Townhouse",
  "Manufactured",
  "Multi-Family",
  "Apartment",
]);

export async function GET(request) {
  try {
    const apiKey = process.env.RENTCAST_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Rent estimates are not connected yet. Add RENTCAST_API_KEY to the Vercel environment variables.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const address = String(searchParams.get("address") || "").trim();

    if (!address) {
      return NextResponse.json(
        { error: "A full property address is required." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.set("address", address);
    params.set("compCount", "15");
    params.set("maxRadius", "5");
    params.set("daysOld", "270");
    params.set("lookupSubjectAttributes", "true");

    const propertyType = searchParams.get("propertyType");
    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const squareFootage = searchParams.get("squareFootage");

    if (propertyType && ALLOWED_PROPERTY_TYPES.has(propertyType)) {
      params.set("propertyType", propertyType);
    }

    if (bedrooms !== null && bedrooms !== "") {
      const value = Number(bedrooms);
      if (Number.isFinite(value) && value >= 0 && value <= 20) {
        params.set("bedrooms", String(value));
      }
    }

    if (bathrooms !== null && bathrooms !== "") {
      const value = Number(bathrooms);
      if (Number.isFinite(value) && value >= 0 && value <= 20) {
        params.set("bathrooms", String(value));
      }
    }

    if (squareFootage !== null && squareFootage !== "") {
      const value = Number(squareFootage);
      if (Number.isFinite(value) && value > 0 && value <= 100000) {
        params.set("squareFootage", String(value));
      }
    }

    const response = await fetch(
      `https://api.rentcast.io/v1/avm/rent/long-term?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Api-Key": apiKey,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            `Rent provider returned HTTP ${response.status}.`,
        },
        { status: response.status }
      );
    }

    const comparables = Array.isArray(data?.comparables)
      ? data.comparables.map((item) => ({
          id: item.id,
          address: item.address || item.formattedAddress,
          price: item.price ?? item.rent,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          squareFootage: item.squareFootage,
          distance: item.distance,
          propertyType: item.propertyType,
          correlation: item.correlation,
        }))
      : [];

    const subject = data?.subjectProperty || {};

    return NextResponse.json({
      provider: "RentCast",
      formattedAddress:
        data?.address ||
        data?.formattedAddress ||
        address,
      rent:
        data?.rent ??
        data?.rentEstimate ??
        data?.estimatedRent ??
        null,
      rentRange: {
        low:
          data?.rentRange?.low ??
          data?.rentRangeLow ??
          data?.rentEstimateLow ??
          null,
        high:
          data?.rentRange?.high ??
          data?.rentRangeHigh ??
          data?.rentEstimateHigh ??
          null,
      },
      subjectProperty: {
        bedrooms: subject.bedrooms,
        bathrooms: subject.bathrooms,
        squareFootage: subject.squareFootage,
        propertyType: subject.propertyType,
      },
      comparables,
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Rent estimate route error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve the rent estimate right now." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "Brak autoryzacji." },
      { status: 401 }
    );
  }

  const decisions = await prisma.purchaseDecision.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(decisions);
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Brak autoryzacji." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productName = body.productName?.trim();
    const productUrl = body.productUrl?.trim();
    const price = Number(body.price);
    const coolingOffDays = Number(body.coolingOffDays);

    if (!productName) {
      return NextResponse.json(
        { error: "Podaj nazwę produktu." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Podaj poprawną cenę." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(coolingOffDays) ||
      coolingOffDays < 1 ||
      coolingOffDays > 365
    ) {
      return NextResponse.json(
        { error: "Niepoprawna liczba dni." },
        { status: 400 }
      );
    }

    const decisionDate = new Date();

    decisionDate.setDate(
      decisionDate.getDate() + coolingOffDays
    );

    const decision = await prisma.purchaseDecision.create({
      data: {
        productName,
        productUrl: productUrl || null,
        price: price.toFixed(2),
        coolingOffDays,
        decisionDate,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        id: decision.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Błąd zapisu:", error);

    return NextResponse.json(
      { error: "Nie udało się zapisać decyzji." },
      { status: 500 }
    );
  }
}
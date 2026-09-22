import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    const body = await request.json();

    const status = body.status;

    if (status !== "BOUGHT" && status !== "SKIPPED") {
      return NextResponse.json(
        { error: "Niepoprawny status." },
        { status: 400 }
      );
    }

    const existing = await prisma.purchaseDecision.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Nie znaleziono decyzji." },
        { status: 404 }
      );
    }

    const decision = await prisma.purchaseDecision.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(decision);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Nie udało się zmienić decyzji." },
      { status: 500 }
    );
  }
}
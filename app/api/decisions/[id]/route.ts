import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const status = body.status;

    if (status !== "BOUGHT" && status !== "SKIPPED") {
      return NextResponse.json(
        { error: "Niepoprawny status." },
        { status: 400 }
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
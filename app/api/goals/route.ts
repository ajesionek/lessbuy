import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalType } from "@/generated/prisma/client";

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

  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      savings: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(goals);
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

    const name = String(body.name || "").trim();
    const targetAmount = Number(body.targetAmount);
    const type = body.type as GoalType;

    if (!name) {
      return NextResponse.json(
        { error: "Podaj nazwę celu." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return NextResponse.json(
        { error: "Podaj poprawną kwotę celu." },
        { status: 400 }
      );
    }

    if (!Object.values(GoalType).includes(type)) {
      return NextResponse.json(
        { error: "Niepoprawny typ celu." },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        type,
        targetAmount: targetAmount.toFixed(2),
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        id: goal.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Błąd tworzenia celu:", error);

    return NextResponse.json(
      { error: "Nie udało się utworzyć celu." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  GoalType,
  SavingGoal,
} from "@/generated/prisma/client";

function mapGoalType(type?: GoalType): SavingGoal {
  switch (type) {
    case GoalType.IKE:
      return SavingGoal.IKE;

    case GoalType.IKZE:
      return SavingGoal.IKZE;

    case GoalType.INVESTMENTS:
      return SavingGoal.INVESTMENTS;

    case GoalType.SAVINGS:
      return SavingGoal.SAVINGS;

    default:
      return SavingGoal.OTHER;
  }
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

    const decisionId = body.decisionId;
    const amount = Number(body.amount);

    const goalId =
      typeof body.goalId === "string" && body.goalId
        ? body.goalId
        : null;

    if (!decisionId) {
      return NextResponse.json(
        { error: "Brak decyzji zakupowej." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Podaj poprawną kwotę." },
        { status: 400 }
      );
    }

    const decision =
      await prisma.purchaseDecision.findFirst({
        where: {
          id: decisionId,
          userId: session.user.id,
        },

        include: {
          saving: true,
        },
      });

    if (!decision) {
      return NextResponse.json(
        { error: "Nie znaleziono decyzji." },
        { status: 404 }
      );
    }

    if (decision.status !== "SKIPPED") {
      return NextResponse.json(
        {
          error:
            "Oszczędność można zapisać tylko dla zakupu, z którego zrezygnowano.",
        },
        { status: 400 }
      );
    }

    if (decision.saving) {
      return NextResponse.json(
        {
          error:
            "Dla tej decyzji oszczędność już istnieje.",
        },
        { status: 409 }
      );
    }

    if (amount > Number(decision.price)) {
      return NextResponse.json(
        {
          error:
            "Kwota oszczędności nie może być większa niż wartość zakupu.",
        },
        { status: 400 }
      );
    }

    let selectedGoal = null;

    if (goalId) {
      selectedGoal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId: session.user.id,
        },
      });

      if (!selectedGoal) {
        return NextResponse.json(
          { error: "Nie znaleziono celu." },
          { status: 404 }
        );
      }
    }

    const saving = await prisma.saving.create({
      data: {
        amount: amount.toFixed(2),
        goal: mapGoalType(selectedGoal?.type),
        decisionId,
        goalId: selectedGoal?.id ?? null,
      },
    });

    return NextResponse.json(
      {
        id: saving.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Błąd zapisu oszczędności:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Nie udało się zapisać oszczędności.",
      },
      { status: 500 }
    );
  }
}
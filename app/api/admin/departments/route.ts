import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { department, exam, student, user } from "@/lib/db/schema";

type DepartmentStatus = "active" | "draft" | "new";

const departmentStatusSql = sql<DepartmentStatus>`
  case
    when count(distinct case when ${exam.status} = 'published' then ${exam.id} end) > 0 then 'active'
    when count(distinct ${exam.id}) > 0 then 'draft'
    else 'new'
  end
`;

const buildSearchWhere = (search: string) => {
  if (!search) {
    return undefined;
  }

  return or(
    ilike(department.name, `%${search}%`),
    ilike(department.description, `%${search}%`),
    ilike(user.name, `%${search}%`),
    ilike(user.email, `%${search}%`),
  );
};

const ensureAdminSession = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export async function GET(req: Request) {
  try {
    const session = await ensureAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
      1,
    );
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "6", 10) || 6, 1),
      24,
    );
    const search = searchParams.get("search")?.trim() || "";
    const status = (searchParams.get("status")?.trim() || "all") as
      | DepartmentStatus
      | "all";

    const offset = (page - 1) * limit;
    const whereClause = buildSearchWhere(search);
    const statusHavingClause =
      status !== "all" ? sql`${departmentStatusSql} = ${status}` : undefined;

    const departmentsList = await db
      .select({
        id: department.id,
        name: department.name,
        description: department.description,
        imageUrl: department.imageUrl,
        createdAt: department.createdAt,
        teacherId: department.teacherId,
        teacherName: user.name,
        teacherEmail: user.email,
        teacherImage: user.image,
        studentCount: sql<number>`cast(count(distinct ${student.id}) as int)`,
        examCount: sql<number>`cast(count(distinct ${exam.id}) as int)`,
        publishedExamCount: sql<number>`cast(count(distinct case when ${exam.status} = 'published' then ${exam.id} end) as int)`,
        status: departmentStatusSql,
      })
      .from(department)
      .leftJoin(user, eq(department.teacherId, user.id))
      .leftJoin(student, eq(student.departmentId, department.id))
      .leftJoin(exam, eq(exam.departmentId, department.id))
      .where(whereClause)
      .groupBy(department.id, user.id)
      .having(statusHavingClause)
      .orderBy(desc(department.createdAt))
      .limit(limit)
      .offset(offset);

    const matchingDepartmentIds = await db
      .select({ id: department.id })
      .from(department)
      .leftJoin(user, eq(department.teacherId, user.id))
      .leftJoin(student, eq(student.departmentId, department.id))
      .leftJoin(exam, eq(exam.departmentId, department.id))
      .where(whereClause)
      .groupBy(department.id, user.id)
      .having(statusHavingClause);

    const teachersListRaw = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.role, "teacher"))
      .orderBy(user.name);

    const teachersList = await Promise.all(
      teachersListRaw.map(async (teacherRecord) => {
        const assignedDepartments = await db
          .select({
            id: department.id,
            name: department.name,
          })
          .from(department)
          .where(eq(department.teacherId, teacherRecord.id))
          .orderBy(department.name);

        return {
          ...teacherRecord,
          departmentCount: assignedDepartments.length,
          departmentNames: assignedDepartments.map(
            (assignedDepartment) => assignedDepartment.name,
          ),
        };
      }),
    );

    const total = matchingDepartmentIds.length;

    return NextResponse.json({
      success: true,
      data: {
        departments: departmentsList,
        teachers: teachersList,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching admin departments:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error fetching admin departments"),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await ensureAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const name = body.name?.trim();
    const description = body.description?.trim();
    const imageUrl = body.imageUrl?.trim();
    const teacherId = body.teacherId?.trim();

    if (!name || name.length < 2 || !teacherId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name and teacherId",
        },
        { status: 400 },
      );
    }

    const existingDepartment = await db.query.department.findFirst({
      where: eq(department.name, name),
    });

    if (existingDepartment) {
      return NextResponse.json(
        { success: false, message: "Department name already exists" },
        { status: 409 },
      );
    }

    const assignedTeacher = await db.query.user.findFirst({
      where: and(eq(user.id, teacherId), eq(user.role, "teacher")),
    });

    if (!assignedTeacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 },
      );
    }

    const [createdDepartment] = await db
      .insert(department)
      .values({
        id: nanoid(),
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        teacherId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Department created successfully",
      data: createdDepartment,
    });
  } catch (error: unknown) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error, "Error creating department"),
      },
      { status: 500 },
    );
  }
}

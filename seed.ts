import { db } from "@/lib/db";

import { student } from "@/lib/db/schema";

async function seedStudents() {
  try {
    await db.insert(student).values([
      // IT students
      {
        id: crypto.randomUUID(),

        fullName: "Ahmed Ali",

        studentNumber: "112233S",

        departmentId: "639eabc9-06fb-416b-93fa-0dd18d9f74a5",
      },

      {
        id: crypto.randomUUID(),

        fullName: "Fatima Hassan",

        studentNumber: "11223344S",

        departmentId: "639eabc9-06fb-416b-93fa-0dd18d9f74a5",
      },

      // Agriculture students
      {
        id: crypto.randomUUID(),

        fullName: "Mohamed Yusuf",

        studentNumber: "1122334455S",

        departmentId: "639eabc9-06fb-416b-93fa-0dd18d9f74a5",
      },

     
    ]);

    console.log(
      "Students seeded successfully"
    );
  } catch (error) {
    console.error(error);
  }
}

seedStudents();
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./db";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin as adminRole, teacher } from "./role-management/permissions";
import { schema } from "@/lib/db/schema";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  
  emailAndPassword: {
    enabled: true,
    
  },
  plugins: [
          adminPlugin({
            ac,
            roles: {
                admin: adminRole,
                teacher: teacher,
            }
        }),
    ]
});
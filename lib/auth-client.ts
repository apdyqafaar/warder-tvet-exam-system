import { createAuthClient } from "better-auth/client"
import { adminClient } from "better-auth/client/plugins"
import { ac, admin as adminRole, teacher, } from "./role-management/permissions"

export const client = createAuthClient({
    plugins: [
        adminClient({
            ac,
            roles: {
                admin: adminRole,
                teacher: teacher,
            }
        })
    ]
})